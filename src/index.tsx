import { definePlugin, ServerAPI, staticClasses, LifetimeNotification } from "decky-frontend-lib";
import { Toast } from "./helpers/toast";
import { Logger } from "./helpers/logger";
import { ApiClient } from "./helpers/apiClient";
import { ApplicationState } from "./helpers/state";
import { Content } from "./pages/RenderDCSMenu";
import { Translator } from "./helpers/translator";
import { Storage } from './helpers/storage';
import { Backend } from './helpers/backend';
import { AppDetailsStore } from "./helpers/types";
import { FaSave } from "react-icons/fa";
import ConfigurePathsPage from "./pages/ConfigurePathsPage";
import ConfigureBackendPage from "./pages/ConfigureBackendPage";
import RenderSyncErrorLogPage from "./pages/RenderSyncErrorLogPage";
import RenderSyncLogPage from "./pages/RenderSyncLogPage";
import RenderPluginLogPage from "./pages/RenderPluginLogPage";

declare const appDetailsStore: AppDetailsStore;

export default definePlugin((serverApi: ServerAPI) => {
  ApplicationState.initialize(serverApi);
  Backend.initialize(serverApi);
  Logger.initialize();
  Translator.initialize();

  serverApi.routerHook.addRoute("/dcs-configure-paths", () => <ConfigurePathsPage serverApi={serverApi} />, { exact: true });
  serverApi.routerHook.addRoute("/dcs-configure-backend", () => <ConfigureBackendPage serverApi={serverApi} />, { exact: true });
  serverApi.routerHook.addRoute("/dcs-error-sync-logs", () => <RenderSyncErrorLogPage />, { exact: true });
  serverApi.routerHook.addRoute("/dcs-sync-logs", () => <RenderSyncLogPage />, { exact: true });
  serverApi.routerHook.addRoute("/dcs-plugin-logs", () => <RenderPluginLogPage />, { exact: true });

  const { unregister: removeGameExecutionListener } = SteamClient.GameSessions.RegisterForAppLifetimeNotifications((e: LifetimeNotification) => {
    const game = appDetailsStore.GetAppDetails(e.unAppID)!;

    if (e.bRunning) {
      Logger.info("Started game '" + game.strDisplayName + "' (" + e.unAppID + ")");
    } else {
      Logger.info("Stopped game '" + game.strDisplayName + "' (" + e.unAppID + ")");
    }
    if (ApplicationState.getAppState().currentState.sync_on_game_exit === "true") {
      let sync: boolean = false;
      if (game.iInstallFolder == -1) {
        sync = true;
        Logger.info("Non Steam game, proceed");
      } else if (game.bCloudAvailable && game.bCloudEnabledForApp && game.bCloudEnabledForAccount) {
        Logger.info("Game with enabled Steam Cloud, skipping");
      } else {
        Logger.info("Steam game with Steam Cloud disabled, proceed")
        sync = true
      }

      if (sync) {
        let toast = ApplicationState.getAppState().currentState.toast_auto_sync === "true";
        if (e.bRunning) {
          if (toast) {
            Toast.toast(Translator.translate("synchronizing.savedata"), 2000);
          }
          ApiClient.syncOnLaunch(toast, e.nInstanceID); // nInstanceID is Linux Process PID
        } else {
          ApiClient.syncOnEnd(toast);
        }
      }
    } else {
      Logger.info("No futher actions")
    }
  });

Storage.clearAllSessionStorage()

return {
  title: <div className={staticClasses.Title}>Decky Cloud Save</div>,
  content: <Content />,
  icon: <FaSave />,
  onDismount() {
    serverApi.routerHook.removeRoute("/dcs-configure-paths");
    serverApi.routerHook.removeRoute("/dcs-configure-backend");
    serverApi.routerHook.removeRoute("/dcs-error-sync-logs");
    serverApi.routerHook.removeRoute("/dcs-sync-logs");
    serverApi.routerHook.removeRoute("/dcs-plugin-logs");
    removeGameExecutionListener();
    Storage.clearAllSessionStorage()
  },
};
});
