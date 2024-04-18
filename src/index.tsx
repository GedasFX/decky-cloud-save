import { definePlugin, ServerAPI, staticClasses, LifetimeNotification } from "decky-frontend-lib";
import * as utils from "./helpers/utils";
import ConfigurePathsPage from "./pages/ConfigurePathsPage";
import { syncOnEnd, syncOnLaunch } from "./helpers/apiClient";
import ConfigureBackendPage from "./pages/ConfigureBackendPage";
import RenderRcloneLogsPage from "./pages/RenderRcloneLogsPage";
import appState from "./helpers/state";
import { Content } from "./pages/RenderDCSMenu";
import { initialize } from "./helpers/translator";
import { log } from "./helpers/utils";

export default definePlugin((serverApi: ServerAPI) => {
  appState.initialize(serverApi);

  serverApi.routerHook.addRoute("/dcs-configure-paths", () => <ConfigurePathsPage serverApi={serverApi} />, { exact: true });
  serverApi.routerHook.addRoute("/dcs-configure-backend", () => <ConfigureBackendPage serverApi={serverApi} />, { exact: true });
  serverApi.routerHook.addRoute("/dcs-configure-logs", () => <RenderRcloneLogsPage />, { exact: true });

  const { unregister: removeGameExecutionListener } = SteamClient.GameSessions.RegisterForAppLifetimeNotifications((e: LifetimeNotification) => {
    if (appState.currentState.sync_on_game_exit === "true") {
      const game = appDetailsStore.GetAppDetails(e.unAppID);
      if (game.bCloudAvailable && game.bCloudEnabledForApp && game.bCloudEnabledForAccount) {
        log("Skipping due to Cloud Save");
      } else {
        let toast = appState.currentState.toast_auto_sync === "true";
        if (e.bRunning) {
          syncOnLaunch(toast, e.nInstanceID);
        } else {
          syncOnEnd(toast);
        }
      }
    }
  });

  sessionStorage.removeItem("syncing");
  sessionStorage.setItem("dcs-loaded", new Date().toString());
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
      sessionStorage.removeItem("syncing");
      sessionStorage.removeItem("dcs-loaded");
    },
  };
});
