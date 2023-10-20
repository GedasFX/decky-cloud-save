import { ServerAPI } from "decky-frontend-lib";
import { useEffect, useState } from "react";

type State = {
  sync_on_game_exit: string;
  syncing: string;
  bisync_enabled: string;
  experimental_menu: string;
  toast_auto_sync: string;
};

class AppState {
  private _subscribers: { id: number; callback: (e: State) => void }[] = [];

  private _currentState: State = {
    syncing: "false",
    sync_on_game_exit: "true",
    bisync_enabled: "false",
    experimental_menu: "false",
    toast_auto_sync: "true"
  };

  private _serverApi: ServerAPI = null!;

  public get currentState() {
    return this._currentState;
  }

  public get serverApi() {
    return this._serverApi;
  }

  public async initialize(serverApi: ServerAPI) {
    this._serverApi = serverApi;

    const data = await serverApi.callPluginMethod<{}, string[][]>("get_config", {});
    if (data.success) {
      data.result.forEach((e) => this.setState(e[0] as keyof State, e[1]));
    } else {
      console.error(data);
    }
  }

  public setState = (key: keyof State, value: string, persist = false) => {
    this._currentState = { ...this.currentState, [key]: value };

    console.log(key, value, persist);

    if (persist) {
      this.serverApi.callPluginMethod<{ key: string; value: string }, null>("set_config", { key, value }).then(e => console.log(e));
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

const appState = new AppState();
export default appState;

export const useAppState = () => {
  const [state, setState] = useState<State>(appState.currentState);

  useEffect(() => {
    const id = appState.subscribe((e) => {
      console.log("Rendering:", e);
      setState(e);
    });
    return () => {
      appState.unsubscribe(id);
    };
  }, []);

  return state;
};

export const setAppState = appState.setState;
export const setbisync_enabled = appState.setbisync_enabled;
export const getServerApi = () => appState.serverApi;
