import { ButtonItem, definePlugin, LifetimeNotification, PanelSection, PanelSectionRow, Router, ServerAPI, staticClasses } from "decky-frontend-lib";
import { useEffect, useState, VFC } from "react";
import { FaSave } from "react-icons/fa";
import { FiEdit3 } from "react-icons/fi";
import { AiOutlineCloudUpload } from "react-icons/ai";
import ConfigurePathsPage from "./pages/ConfigurePathsPage";
import { getCloudBackend, syncNow } from "./apiClient";
import Head from "./components/Head";
import ConfigureBackendPage from "./pages/ConfigureBackendPage";
import DeckyStoreButton from "./components/DeckyStoreButton";

const Content: VFC<{ serverAPI: ServerAPI }> = ({ serverAPI }) => {
  const [syncing, setSyncing] = useState(false);

  const [hasProvider, setHasProvider] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    getCloudBackend(serverAPI).then((e) => setHasProvider(!!e));
  }, []);

  return (
    <>
      <Head />
      <PanelSection title="Sync Now">
        <PanelSectionRow>
          <ButtonItem
            layout="below"
            disabled={syncing || !hasProvider}
            onClick={() => {
              setSyncing(true);
              syncNow(serverAPI).finally(() => setSyncing(false));
            }}
          >
            <DeckyStoreButton icon={<FaSave className={syncing ? "dcs-rotate" : ""} />}>Sync Now</DeckyStoreButton>
          </ButtonItem>
          {hasProvider === false && <small>Cloud Storage Provider is not configured. Please configure it in 'Cloud Provider'.</small>}
        </PanelSectionRow>
      </PanelSection>

      <PanelSection title="Configuration">
        <PanelSectionRow>
          <ButtonItem
            layout="below"
            onClick={() => {
              Router.CloseSideMenus();
              Router.Navigate("/dcs-configure-paths");
            }}
          >
            <DeckyStoreButton icon={<FiEdit3 />}>Sync Paths</DeckyStoreButton>
          </ButtonItem>
        </PanelSectionRow>

        <PanelSectionRow>
          <ButtonItem
            layout="below"
            onClick={() => {
              Router.CloseSideMenus();
              Router.Navigate("/dcs-configure-backend");
            }}
          >
            <DeckyStoreButton icon={<AiOutlineCloudUpload />}>Cloud Provider</DeckyStoreButton>
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
      syncNow(serverApi);
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
