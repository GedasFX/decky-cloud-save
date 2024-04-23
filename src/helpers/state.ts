import { ServerAPI } from "decky-frontend-lib";
import { useEffect, useState } from "react";
import { Logger } from "./logger";

type State = {
  sync_on_game_exit: string;
  syncing: string;
  bisync_enabled: string;
  experimental_menu: string;
  toast_auto_sync: string;
  destination_directory: string;
};

class AppState {
  private _subscribers: { id: number; callback: (e: State) => void }[] = [];

  private _currentState: State = {
    syncing: "false",
    sync_on_game_exit: "true",
    bisync_enabled: "false",
    experimental_menu: "false",
    toast_auto_sync: "true",
    destination_directory: "decky-cloud-save"
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

    const data = await serverApi.callPluginMethod<{}, string[][]>("get_config", {});
    if (data.success) {
      data.result.forEach((e) => this.setState(e[0] as keyof State, e[1]));
    } else {
      Logger.error(data);
    }
  }

  public setState = (key: keyof State, value: string, persist = false) => {
    this._currentState = { ...this.currentState, [key]: value };

    Logger.debug("Setting '" + key + "' to '" + value + "' with persistence: " + persist);

    if (persist) {
      this.serverApi.callPluginMethod<{ key: string; value: string }, null>("set_config", { key, value }).then(e => Logger.debug(e));
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
  private static appState = new AppState();
  
  public static initialize(serverApi: ServerAPI) {
    this.appState.initialize(serverApi);
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
  public static setbisync_enabled = ApplicationState.appState.setbisync_enabled;
  public static getServerApi = () => ApplicationState.appState.serverApi;
}
