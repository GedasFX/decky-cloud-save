import { ButtonItem, Navigation, PanelSection, PanelSectionRow, ToggleField } from "decky-frontend-lib";
import { useEffect, useState, VFC } from "react";
import { FaSave } from "react-icons/fa";
import { FiEdit3 } from "react-icons/fi";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { getCloudBackend, syncNow } from "../helpers/apiClient";
import Head from "../components/Head";
import DeckyStoreButton from "../components/DeckyStoreButton";
import { setAppState, useAppState } from "../helpers/state";
import { translate } from "../helpers/translator";

// TODO
export const Content: VFC<{}> = () => {
  const appState = useAppState();

  const [hasProvider, setHasProvider] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    getCloudBackend().then((e) => setHasProvider(!!e));
  }, []);

  return (
    <>
      <Head />
      <PanelSection title={translate("sync")}>
        <PanelSectionRow>
          <ButtonItem layout="below" disabled={appState.syncing === "true" || !hasProvider} onClick={() => syncNow(true)}>
            <DeckyStoreButton icon={<FaSave className={appState.syncing === "true" ? "dcs-rotate" : ""} />}>{translate("sync.now")}</DeckyStoreButton>
          </ButtonItem>
          {hasProvider === false && <small>{translate("provider.not.configured")}.</small>}
        </PanelSectionRow>
      </PanelSection>

      <PanelSection title={translate("configuration")}>
        <PanelSectionRow>
          <ToggleField
            label={translate("sync.start.stop")}
            checked={appState.sync_on_game_exit === "true"}
            onChange={(e) => setAppState("sync_on_game_exit", e ? "true" : "false", true)}
          />
          <ToggleField
            disabled={appState.sync_on_game_exit != "true"}
            label={translate("toast.auto.sync")}
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
            <DeckyStoreButton icon={<FiEdit3 />}>{translate("sync.paths")}</DeckyStoreButton>
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
            <DeckyStoreButton icon={<AiOutlineCloudUpload />}>{translate("cloud.provider")}</DeckyStoreButton>
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>
      <PanelSection title={translate("experimental.use.risk")}>
        <PanelSectionRow>
          <ToggleField
            label={translate("bidirectional.sync")}
            checked={appState.bisync_enabled === "true"}
            onChange={(e) => setAppState("bisync_enabled", e ? "true" : "false", true)}
          />
        </PanelSectionRow>
      </PanelSection>
    </>
  );
};
