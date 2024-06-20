import { ServerAPI } from "decky-frontend-lib";
import { useEffect, useState } from "react";
import { Logger } from "./logger";

export type LibrarySyncState = {
  Documents: LibrarySyncStateEntry;
  Music: LibrarySyncStateEntry;
  Pictures: LibrarySyncStateEntry;
  Videos: LibrarySyncStateEntry;
};

interface LibrarySyncStateEntry {
  enabled: boolean;
  bisync: boolean;
  destination: string;
};

class AppState {
  private _subscribers: { id: number; callback: (e: LibrarySyncState) => void }[] = [];

  private _currentState: LibrarySyncState = {
    Documents: { enabled: false, bisync: false, destination: "deck-libraries/Documents" },
    Music: { enabled: false, bisync: false, destination: "deck-libraries/Music" },
    Pictures: { enabled: false, bisync: false, destination: "deck-libraries/Pictures" },
    Videos: { enabled: false, bisync: false, destination: "deck-libraries/Videos" },
  };

  private _serverApi: ServerAPI = null!;
  private _alreadyInit: boolean = true!;

  public get currentState() {
    return this._currentState;
  }

  public get serverApi() {
    return this._serverApi;
  }

  public get alreadyInit() {
    return this._alreadyInit;
  }

  public async initialize(serverApi: ServerAPI) {
    if (this._serverApi == null) {
      this._alreadyInit = false;
    }

    this._serverApi = serverApi;

    const data = await serverApi.callPluginMethod<{}, LibrarySyncState>("get_library_sync_config", {});
    if (data.success) {
      this.setState("Documents", { enabled: data.result.Documents.enabled, bisync: data.result.Documents.bisync, destination: data.result.Documents.destination });
      this.setState("Music", { enabled: data.result.Music.enabled, bisync: data.result.Music.bisync, destination: data.result.Music.destination });
      this.setState("Pictures", { enabled: data.result.Pictures.enabled, bisync: data.result.Pictures.bisync, destination: data.result.Pictures.destination });
      this.setState("Videos", { enabled: data.result.Videos.enabled, bisync: data.result.Videos.bisync, destination: data.result.Videos.destination });
    } else {
      Logger.error(data);
    }
  }

  public setState = (key: keyof LibrarySyncState, values: Partial<{ enabled: boolean; bisync: boolean; destination: string }>, persist = false) => {
    let entry = this._currentState[key];
    if (values.enabled !== undefined) {
      entry.enabled = values.enabled;
    }
    if (values.bisync !== undefined) {
      entry.bisync = values.bisync;
    }
    if (values.destination !== undefined) {
      entry.destination = values.destination;
    }

    if (persist) {
      this.serverApi
        .callPluginMethod<{ key: string; enabled: boolean; bisync: boolean, destination: string }, void>("set_library_sync_config", {
          key,
          enabled: entry.enabled,
          bisync: entry.bisync,
          destination: entry.destination,
        })
        .then(e => Logger.debug(e));
    }

    this._subscribers.forEach((e) => e.callback(this.currentState));
  }

  public subscribe = (callback: (e: LibrarySyncState) => void) => {
    const id = new Date().getTime();
    this._subscribers.push({ id, callback });

    return id;
  };

  public unsubscribe = (id: number) => {
    const index = this._subscribers.findIndex((f) => f.id === id);
    if (index > -1) {
      this._subscribers.splice(index, 1);
    }
  };
}

export class ApplicationLibrarySyncState {

  private constructor(){
  }

  private static appState = new AppState();

  public static async initialize(serverApi: ServerAPI) {
    await this.appState.initialize(serverApi);
  }

  public static useAppState = () => {
    const [state, setState] = useState<LibrarySyncState>(ApplicationLibrarySyncState.appState.currentState);

    useEffect(() => {
      const id = ApplicationLibrarySyncState.appState.subscribe((e) => {
        Logger.debug("Rendering: " + JSON.stringify(e));
        setState(e);
      });
      return () => {
        ApplicationLibrarySyncState.appState.unsubscribe(id);
      };
    }, []);

    return state;
  };

  public static getAppState(): AppState {
    return ApplicationLibrarySyncState.appState;
  }
  public static setAppState = ApplicationLibrarySyncState.appState.setState;
  public static getServerApi = () => ApplicationLibrarySyncState.appState.serverApi;
}
