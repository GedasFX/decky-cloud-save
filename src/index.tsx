import { definePlugin, ServerAPI, staticClasses, LifetimeNotification } from "decky-frontend-lib";
import { Toast } from "./helpers/toast";
import { Logger } from "./helpers/logger";
import { ApiClient } from "./helpers/apiClient";
import { ApplicationState } from "./helpers/state";
import { Content } from "./pages/RenderDCSMenu";
import { Translator } from "./helpers/translator";
import { Storage } from "./helpers/storage";
import { Backend } from "./helpers/backend";
import { FaSave } from "react-icons/fa";
import ConfigurePathsPage from "./pages/ConfigurePathsPage";
import ConfigureBackendPage from "./pages/ConfigureBackendPage";
import RenderSyncLogPage from "./pages/RenderSyncLogPage";
import RenderPluginLogPage from "./pages/RenderPluginLogPage";

declare const appStore: any;

export default definePlugin((serverApi: ServerAPI) => {
  Storage.clearAllSessionStorage();
  ApplicationState.initialize(serverApi).then(async () => {
    Backend.initialize(serverApi);
    await Logger.initialize();
    await Translator.initialize();
  });

  serverApi.routerHook.addRoute("/dcs-configure-paths", () => <ConfigurePathsPage serverApi={serverApi} />, { exact: true });
  serverApi.routerHook.addRoute("/dcs-configure-backend", () => <ConfigureBackendPage serverApi={serverApi} />, { exact: true });
  serverApi.routerHook.addRoute("/dcs-sync-logs", () => <RenderSyncLogPage />, { exact: true });
  serverApi.routerHook.addRoute("/dcs-plugin-logs", () => <RenderPluginLogPage />, { exact: true });

  const { unregister: removeGameExecutionListener } = SteamClient.GameSessions.RegisterForAppLifetimeNotifications((e: LifetimeNotification) => {
    const currentState = ApplicationState.getAppState().currentState;
    if (currentState.sync_on_game_exit === "true") {
      const gameInfo = appStore.GetAppOverviewByGameID(e.unAppID);
      Logger.info((e.bRunning ? "Starting" : "Stopping") + " game '" + gameInfo.display_name + "' (" + e.unAppID + ")");

      ApplicationState.setAppState("playing", String(e.bRunning));

      if (shouldSync(gameInfo)) {
        syncGame(e);
      }
    } else {
      Logger.info("No futher actions");
    }
  });

  return {
    title: <div className={staticClasses.Title}>Decky Cloud Save</div>,
    content: <Content />,
    icon: <FaSave />,
    onDismount() {
      removeGameExecutionListener();
      Storage.clearAllSessionStorage();
      serverApi.routerHook.removeRoute("/dcs-configure-paths");
      serverApi.routerHook.removeRoute("/dcs-configure-backend");
      serverApi.routerHook.removeRoute("/dcs-sync-logs");
      serverApi.routerHook.removeRoute("/dcs-plugin-logs");
    },
  };
});

function syncGame(e: LifetimeNotification) {
  const currentState = ApplicationState.getAppState().currentState;
  let toast = currentState.toast_auto_sync === "true";
  if (e.bRunning) {
    // Only sync at start when bisync is enabled. No need to when its not.
    if (currentState.bisync_enabled === "true") {
      if (toast) {
        Toast.toast(Translator.translate("synchronizing.savedata"), 2000);
      }
      ApiClient.syncOnLaunch(toast, e.nInstanceID); // nInstanceID is Linux Process PID
    }
  } else {
    ApiClient.syncOnEnd(toast);
  }
}

function shouldSync(gameInfo: any) {
  if (gameInfo?.store_category.includes(23)) {
    // 23 - Cloud Save
    Logger.info("Steam game with Steam Cloud, skipping");
    return false;
  } else {
    Logger.info("Non Steam game, or game without Steam Cloud, proceeding");
    return true;
  }
}
