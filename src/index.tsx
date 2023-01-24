import { ButtonItem, definePlugin, LifetimeNotification, PanelSection, PanelSectionRow, Router, ServerAPI, staticClasses } from "decky-frontend-lib";
import { useState, VFC } from "react";
import { FaSave } from "react-icons/fa";
import { FiEdit3 } from "react-icons/fi";
import { AiOutlineCloudUpload } from "react-icons/ai";
import ConfigurePathsPage from "./pages/ConfigurePathsPage";
import { startSync } from "./util/sync";
import Head from "./components/Head";
import ConfigureBackendPage from "./pages/ConfigureBackendPage";

const Content: VFC<{ serverAPI: ServerAPI }> = ({ serverAPI }) => {
  const [syncing, setSyncing] = useState(false);

  return (
    <>
      <Head />
      <PanelSection title="Panel Section">
        <PanelSectionRow>
          <ButtonItem
            icon={<FaSave className={syncing ? "dcs-rotate" : ""} />}
            layout="below"
            disabled={syncing}
            onClick={() => {
              setSyncing(true);
              startSync(serverAPI).finally(() => setSyncing(false));
            }}
          >
            Sync Now <div className="rotate">aaads</div>
          </ButtonItem>
        </PanelSectionRow>

        <PanelSectionRow>
          <ButtonItem
            icon={<FiEdit3 />}
            layout="below"
            onClick={() => {
              Router.CloseSideMenus();
              Router.Navigate("/dcs-configure-paths");
            }}
          >
            Configure Paths
          </ButtonItem>
        </PanelSectionRow>

        <PanelSectionRow>
          <ButtonItem
            icon={<AiOutlineCloudUpload />}
            layout="below"
            onClick={() => {
              Router.CloseSideMenus();
              Router.Navigate("/dcs-configure-backend");
            }}
          >
            Configure Cloud
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>
    </>
  );
};

export default definePlugin((serverApi: ServerAPI) => {
  serverApi.routerHook.addRoute("/dcs-configure-paths", () => <ConfigurePathsPage serverApi={serverApi} />, { exact: true });
  serverApi.routerHook.addRoute("/dcs-configure-backend", () => <ConfigureBackendPage serverApi={serverApi} />, { exact: true });

  const { unregister: removeGameExitListener } = SteamClient.GameSessions.RegisterForAppLifetimeNotifications((e: LifetimeNotification) => {
    if (!e.bRunning) {
      startSync(serverApi);
    }
  });

  return {
    title: <div className={staticClasses.Title}>Decky Cloud Save</div>,
    content: <Content serverAPI={serverApi} />,
    icon: <FaSave />,
    onDismount() {
      serverApi.routerHook.removeRoute("/dcs-configure-paths");
      serverApi.routerHook.removeRoute("/dcs-configure-backend");
      removeGameExitListener();
    },
  };
});
