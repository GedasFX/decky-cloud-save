import {
  ButtonItem,
  definePlugin,
  LifetimeNotification,
  Navigation,
  PanelSection,
  PanelSectionRow,
  ServerAPI,
  staticClasses,
  ToggleField,
} from "decky-frontend-lib";
import { useEffect, useState, VFC } from "react";
import { FaSave } from "react-icons/fa";
import { FiEdit3 } from "react-icons/fi";
import { AiOutlineCloudUpload } from "react-icons/ai";
import ConfigurePathsPage from "./pages/ConfigurePathsPage";
import { getCloudBackend, syncNow } from "./apiClient";
import Head from "./components/Head";
import ConfigureBackendPage from "./pages/ConfigureBackendPage";
import DeckyStoreButton from "./components/DeckyStoreButton";
import appState, { setAppState, useAppState } from "./state";

const Content: VFC<{}> = () => {
  const appState = useAppState();
  console.log("Rendering index", appState);

  const [hasProvider, setHasProvider] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    getCloudBackend().then((e) => setHasProvider(!!e));
  }, []);

  return (
    <>
      <Head />
      <PanelSection title="Sync">
        <PanelSectionRow>
          <ButtonItem layout="below" disabled={appState.syncing === "true" || !hasProvider} onClick={() => syncNow(true)}>
            <DeckyStoreButton icon={<FaSave className={appState.syncing === "true" ? "dcs-rotate" : ""} />}>Sync Now</DeckyStoreButton>
          </ButtonItem>
          {hasProvider === false && <small>Cloud Storage Provider is not configured. Please configure it in 'Cloud Provider'.</small>}
        </PanelSectionRow>
      </PanelSection>

      <PanelSection title="Configuration">
        <PanelSectionRow>
          <ToggleField
            label="Sync after closing a game"
            checked={appState.sync_on_game_exit === "true"}
            onChange={(e) => setAppState("sync_on_game_exit", e ? "true" : "false", true)}
          />
          <ToggleField
            disabled={appState.sync_on_game_exit != "true"}
            label="Toast after auto sync"
            checked={appState.toast_auto_sync === "true"}
            onChange={(e) => setAppState("toast_auto_sync", e ? "true" : "false", true)}
          />
        </PanelSectionRow>

        <PanelSectionRow>
          <ButtonItem
            layout="below"
            onClick={() => {
              Navigation.CloseSideMenus();
              Navigation.Navigate("/dcs-configure-paths");
            }}
          >
            <DeckyStoreButton icon={<FiEdit3 />}>Sync Paths</DeckyStoreButton>
          </ButtonItem>
        </PanelSectionRow>

        <PanelSectionRow>
          <ButtonItem
            layout="below"
            onClick={() => {
              Navigation.CloseSideMenus();
              Navigation.Navigate("/dcs-configure-backend");
            }}
          >
            <DeckyStoreButton icon={<AiOutlineCloudUpload />}>Cloud Provider</DeckyStoreButton>
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>
      {appState.experimental_menu === "true" && (
        <PanelSection title="Experimental USE AT OWN RISK">
          <PanelSectionRow>
            <ToggleField
              label="Bidirectional Sync"
              checked={appState.bisync_enabled === "true"}
              onChange={(e) => setAppState("bisync_enabled", e ? "true" : "false", true)}
            />
          </PanelSectionRow>
        </PanelSection>
      )}
    </>
  );
};

export default definePlugin((serverApi: ServerAPI) => {
  appState.initialize(serverApi);

  serverApi.routerHook.addRoute("/dcs-configure-paths", () => <ConfigurePathsPage serverApi={serverApi} />, { exact: true });
  serverApi.routerHook.addRoute("/dcs-configure-backend", () => <ConfigureBackendPage serverApi={serverApi} />, { exact: true });

  const { unregister: removeGameExitListener } = SteamClient.GameSessions.RegisterForAppLifetimeNotifications((e: LifetimeNotification) => {
    if (!e.bRunning && appState.currentState.sync_on_game_exit === "true") {
      syncNow(appState.currentState.toast_auto_sync === "true");
    }
  });

  return {
    title: <div className={staticClasses.Title}>Decky Cloud Save</div>,
    content: <Content />,
    icon: <FaSave />,
    onDismount() {
      serverApi.routerHook.removeRoute("/dcs-configure-paths");
      serverApi.routerHook.removeRoute("/dcs-configure-backend");
      removeGameExitListener();
    },
  };
});
