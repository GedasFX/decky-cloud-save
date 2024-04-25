import { definePlugin, ServerAPI, staticClasses, LifetimeNotification } from "decky-frontend-lib";
import { Toast } from "./helpers/toast";
import { Logger } from "./helpers/logger";
import { ApiClient } from "./helpers/apiClient";
import { ApplicationState } from "./helpers/state";
import { Content } from "./pages/RenderDCSMenu";
import { Translator } from "./helpers/translator";
import { Storage } from './helpers/storage';
import { Backend } from './helpers/backend';
import { FaSave } from "react-icons/fa";
import ConfigurePathsPage from "./pages/ConfigurePathsPage";
import ConfigureBackendPage from "./pages/ConfigureBackendPage";
import RenderSyncErrorLogPage from "./pages/RenderSyncErrorLogPage";
import RenderSyncLogPage from "./pages/RenderSyncLogPage";
import RenderPluginLogPage from "./pages/RenderPluginLogPage";

declare const appStore: any;

export default definePlugin((serverApi: ServerAPI) => {
  Storage.clearAllSessionStorage()
  ApplicationState.initialize(serverApi).then(async () => {
    Backend.initialize(serverApi);
    await Logger.initialize();
    await Translator.initialize();
  });

  serverApi.routerHook.addRoute("/dcs-configure-paths", () => <ConfigurePathsPage serverApi={serverApi} />, { exact: true });
  serverApi.routerHook.addRoute("/dcs-configure-backend", () => <ConfigureBackendPage serverApi={serverApi} />, { exact: true });
  serverApi.routerHook.addRoute("/dcs-error-sync-logs", () => <RenderSyncErrorLogPage />, { exact: true });
  serverApi.routerHook.addRoute("/dcs-sync-logs", () => <RenderSyncLogPage />, { exact: true });
  serverApi.routerHook.addRoute("/dcs-plugin-logs", () => <RenderPluginLogPage />, { exact: true });

  const { unregister: removeGameExecutionListener } = SteamClient.GameSessions.RegisterForAppLifetimeNotifications((e: LifetimeNotification) => {
    if (ApplicationState.getAppState().currentState.sync_on_game_exit === "true") {
      const gameInfo = appStore.GetAppOverviewByGameID(e.unAppID)
      if (e.bRunning) {
        Logger.info("Started game '" + gameInfo.display_name + "' (" + e.unAppID + ")");
      } else {
        Logger.info("Stopped game '" + gameInfo.display_name + "' (" + e.unAppID + ")");
      }

      let sync: boolean;
      if (gameInfo?.app_type === 1) {
        if (gameInfo?.local_per_client_data?.cloud_status === 1) {
          sync = true;
          Logger.info("Steam game without Steam Cloud, proceed")
        } else {
          sync = false;
          Logger.info("Steam game with Steam Cloud, skipping");
        }
      } else {
        sync = true;
        Logger.info("Non Steam game, proceed");
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
