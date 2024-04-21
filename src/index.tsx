import { definePlugin, ServerAPI, staticClasses, LifetimeNotification } from "decky-frontend-lib";
import * as utils from "./helpers/toast";
import * as logger from "./helpers/logger";
import ConfigurePathsPage from "./pages/ConfigurePathsPage";
import { syncOnEnd, syncOnLaunch } from "./helpers/apiClient";
import ConfigureBackendPage from "./pages/ConfigureBackendPage";
import RenderRcloneLogsPage from "./pages/RenderRcloneLogsPage";
import appState from "./helpers/state";
import { Content } from "./pages/RenderDCSMenu";
import { initialize, translate } from "./helpers/translator";
import * as storage from './helpers/storage';
import * as backend from './helpers/backend';
import { AppDetailsStore } from "./helpers/types";

declare const appDetailsStore: AppDetailsStore;

export default definePlugin((serverApi: ServerAPI) => {
  appState.initialize(serverApi);
  backend.initialize(serverApi);

  serverApi.routerHook.addRoute("/dcs-configure-paths", () => <ConfigurePathsPage serverApi={serverApi} />, { exact: true });
  serverApi.routerHook.addRoute("/dcs-configure-backend", () => <ConfigureBackendPage serverApi={serverApi} />, { exact: true });
  serverApi.routerHook.addRoute("/dcs-configure-logs", () => <RenderRcloneLogsPage />, { exact: true });

  const { unregister: removeGameExecutionListener } = SteamClient.GameSessions.RegisterForAppLifetimeNotifications((e: LifetimeNotification) => {
    const game = appDetailsStore.GetAppDetails(e.unAppID)!;
    
    logger.info("Received game status change for " + game.strDisplayName + "(" + e.unAppID + "). Running: " + e.bRunning);
    if (appState.currentState.sync_on_game_exit === "true") {
      if (game.bCloudAvailable && game.bCloudEnabledForApp && game.bCloudEnabledForAccount) {
        logger.info("Skipping due to Cloud Save");
      } else {
        logger.info("Synchronizing")
        let toast = appState.currentState.toast_auto_sync === "true";
        if (e.bRunning) {
          if (toast) {
            utils.toast(translate("synchronizing.savedata"), 2000);
          }
          syncOnLaunch(toast, e.nInstanceID); // nInstanceID is Linux Process PID
        } else {
          syncOnEnd(toast);
        }
      }
    } else {
      logger.info("No futher actions")
    }
  });

  storage.clearAllSessionStorage()
  initialize()

  return {
    title: <div className={staticClasses.Title}>Decky Cloud Save</div>,
    content: <Content />,
    icon: <utils.pluginIcon />,
    onDismount() {
      serverApi.routerHook.removeRoute("/dcs-configure-paths");
      serverApi.routerHook.removeRoute("/dcs-configure-backend");
      serverApi.routerHook.removeRoute("/dcs-configure-logs");
      removeGameExecutionListener();
      storage.clearAllSessionStorage()
    },
  };
});
