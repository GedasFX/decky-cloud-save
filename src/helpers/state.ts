import { ServerAPI } from "decky-frontend-lib";
import { useEffect, useState } from "react";
import { Logger } from "./logger";

type State = {
  sync_on_game_exit: boolean;
  syncing: boolean;
  bisync_enabled: boolean;
  experimental_menu: boolean;
  toast_auto_sync: boolean;
  destination_directory: string;
  playing: boolean;
  library_sync: LibrarySyncState;
};

type ValueOf<T> = T[keyof T];

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
  private _subscribers: { id: number; callback: (e: State) => void }[] = [];

  private _currentState: State = {
    syncing: false,
    sync_on_game_exit: true,
    bisync_enabled: false,
    experimental_menu: false,
    toast_auto_sync: true,
    destination_directory: "decky-cloud-save",
    playing: false,
    library_sync: {
      Documents: { enabled: false, bisync: false, destination: "deck-libraries/Documents" },
      Music: { enabled: false, bisync: false, destination: "deck-libraries/Music" },
      Pictures: { enabled: false, bisync: false, destination: "deck-libraries/Pictures" },
      Videos: { enabled: false, bisync: false, destination: "deck-libraries/Videos" },
    },
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

    const data = await serverApi.callPluginMethod<{}, State>("get_config", {});
    if (data.success) {
      for (const [key, value] of Object.entries(data.result)) {
        this.setState(key as keyof State, value as ValueOf<State>);
      }
    } else {
      Logger.error(data);
    }
  }

  public setLibSyncState = (key: keyof LibrarySyncState, values: Partial<{ enabled: boolean; bisync: boolean; destination: string }>, persist = false) => {
    let entry = this._currentState.library_sync[key];
    if (values.enabled !== undefined) {
      entry.enabled = values.enabled;
    }
    if (values.bisync !== undefined) {
      entry.bisync = values.bisync;
    }
    if (values.destination !== undefined) {
      entry.destination = values.destination;
    }

    this.setState("library_sync", this._currentState.library_sync, persist);
  }

  public setState = (key: keyof State, value: ValueOf<State>, persist = false) => {
    this._currentState = { ...this.currentState, [key]: value };

    Logger.debug("Setting '" + key + "' to '" + value + "' with persistence: " + persist);

    if (persist) {
      this.serverApi.callPluginMethod<{ key: string; value: ValueOf<State> }, null>("set_config", { key, value: this._currentState[key] }).then(e => Logger.debug(e));
    }

    this._subscribers.forEach((e) => e.callback(this.currentState));
  };

  public subscribe = (callback: (e: State) => void) => {
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
  public get bidirectionalSync() {
    return this.currentState.bisync_enabled;
  }
  public get experimental_menu() {
    return this.currentState.experimental_menu;
  }


  public setbisync_enabled = (value: string, persist = false) => {
    this.setState("bisync_enabled", value, persist);
  };
}

export class ApplicationState {

  private constructor(){
  }

  private static appState = new AppState();

  public static async initialize(serverApi: ServerAPI) {
    await this.appState.initialize(serverApi);
  }

  public static useAppState = () => {
    const [state, setState] = useState<State>(ApplicationState.appState.currentState);

    useEffect(() => {
      const id = ApplicationState.appState.subscribe((e) => {
        Logger.debug("Rendering: " + JSON.stringify(e));
        setState(e);
      });
      return () => {
        ApplicationState.appState.unsubscribe(id);
      };
    }, []);

    return state;
  };


  public static getAppState(): AppState {
    return ApplicationState.appState;
  }
  public static setAppState = ApplicationState.appState.setState;
  public static setLibSyncState = ApplicationState.appState.setLibSyncState;
  public static setbisync_enabled = ApplicationState.appState.setbisync_enabled;
  public static getServerApi = () => ApplicationState.appState.serverApi;
}
