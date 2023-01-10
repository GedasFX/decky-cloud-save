import { ButtonItem, definePlugin, LifetimeNotification, PanelSection, PanelSectionRow, Router, ServerAPI, staticClasses } from "decky-frontend-lib";
import { useState, VFC } from "react";
import { FaSave } from "react-icons/fa";
import ConfigurePage from "./pages/ConfigurePage";

const Content: VFC<{ serverAPI: ServerAPI }> = ({ serverAPI }) => {
  const [syncing, setSyncing] = useState(false);

  return (
    <PanelSection title="Panel Section">
      <PanelSectionRow>
        <ButtonItem
          layout="below"
          disabled={syncing}
          onClick={() => {
            setSyncing(true);
            serverAPI.callPluginMethod("sync_now", {}).then(() => setSyncing(false));
          }}
        >
          Sync Now
        </ButtonItem>
      </PanelSectionRow>

      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={() => {
            Router.CloseSideMenus();
            Router.Navigate("/dcs-configure");
          }}
        >
          Open Setup
        </ButtonItem>
      </PanelSectionRow>

      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={() => {
            Router.Navigate("/dcs-configure");
          }}
        >
          Open Files
        </ButtonItem>
      </PanelSectionRow>
    </PanelSection>
  );
};

export default definePlugin((serverApi: ServerAPI) => {
  serverApi.routerHook.addRoute("/dcs-configure", () => <ConfigurePage serverApi={serverApi} />, { exact: true });

  const { unregister: removeGameExitListener } = SteamClient.GameSessions.RegisterForAppLifetimeNotifications((e: LifetimeNotification) => {
    if (!e.bRunning) {
      const start = new Date();
      serverApi.toaster.toast({ title: "Decky Cloud Save", body: "Starting Sync" });
      serverApi
        .callPluginMethod("sync_now", {})
        .then(() => serverApi.toaster.toast({ title: "Decky Cloud Save", body: `Sync completed in ${(new Date().getTime() - start.getTime()) / 1000}s.` }));
    }
  });

  return {
    title: <div className={staticClasses.Title}>Decky Cloud Save</div>,
    content: <Content serverAPI={serverApi} />,
    icon: <FaSave />,
    onDismount() {
      serverApi.routerHook.removeRoute("/dcs-configure");
      removeGameExitListener();
    },
  };
});
