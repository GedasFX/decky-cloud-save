import { ButtonItem, Navigation, PanelSection, PanelSectionRow, ToggleField } from "decky-frontend-lib";
import { useEffect, useState, VFC } from "react";
import { FaCloudUploadAlt, FaPlug, FaSave } from "react-icons/fa";
import { FiEdit3 } from "react-icons/fi";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { ApiClient } from "../helpers/apiClient";
import Head from "../components/Head";
import DeckyStoreButton from "../components/DeckyStoreButton";
import { ApplicationState } from "../helpers/state";
import { Translator } from "../helpers/translator";
import { Storage } from "../helpers/storage";
import { Backend } from "../helpers/backend";

// TODO
export const Content: VFC<{}> = () => {
  const appState = ApplicationState.useAppState();

  const [hasProvider, setHasProvider] = useState<boolean | undefined>(undefined);
  useEffect(() => {
    ApiClient.getCloudBackend().then((e) => setHasProvider(!!e));
  }, []);

  return (
    <>
      <Head />
      <PanelSection title={Translator.translate("sync")}>
        <PanelSectionRow>
          <ButtonItem
            layout="below"
            disabled={appState.syncing || (!hasProvider)}
            onClick={() => {
              ApiClient.syncNow(true);
            }}
          >
            <DeckyStoreButton icon={<FaSave className={appState.syncing ? "dcs-rotate" : ""} />}>
              {Translator.translate("sync.now")}
            </DeckyStoreButton>
          </ButtonItem>
          {hasProvider === false && <small>{Translator.translate("provider.not.configured")}.</small>}
        </PanelSectionRow>
      </PanelSection>

      <PanelSection title={Translator.translate("configuration")}>
        <PanelSectionRow>
          <ToggleField
            label={Translator.translate("sync.start.stop")}
            checked={appState.sync_on_game_exit}
            onChange={(e) => ApplicationState.setAppState("sync_on_game_exit", e, true)}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ToggleField
            disabled={!appState.sync_on_game_exit}
            label={Translator.translate("toast.auto.sync")}
            checked={appState.toast_auto_sync}
            onChange={(e) => ApplicationState.setAppState("toast_auto_sync", e, true)}
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
            <DeckyStoreButton icon={<FiEdit3 />}>{Translator.translate("sync.paths")}</DeckyStoreButton>
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
            <DeckyStoreButton icon={<AiOutlineCloudUpload />}>{Translator.translate("cloud.provider")}</DeckyStoreButton>
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>
      <PanelSection title={Translator.translate("log.files")}>
        <PanelSectionRow>
          <ButtonItem
            layout="below"
            onClick={() => {
              (async () => {
                let logs = await Backend.getPluginLog();
                if (logs == "" || logs == null || logs == undefined) {
                  logs = Translator.translate("no.available.logs");
                }
                Storage.setSessionStorageItem("pluginLogs", logs);
                Navigation.Navigate("/dcs-plugin-logs");
                Navigation.CloseSideMenus();
              })();
            }}
          >
            <DeckyStoreButton icon={<FaPlug />}>{Translator.translate("app.logs")}</DeckyStoreButton>
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem
            layout="below"
            disabled={appState.syncing || (!hasProvider)}
            onClick={() => {
              (async () => {
                let logs = await Backend.getLastSyncLog();
                if (logs == "" || logs == null || logs == undefined) {
                  logs = Translator.translate("no.available.logs");
                }
                Storage.setSessionStorageItem("syncLogs", logs);
                Navigation.Navigate("/dcs-sync-logs");
                Navigation.CloseSideMenus();
              })();
            }}
          >
            <DeckyStoreButton icon={<FaCloudUploadAlt />}>{Translator.translate("sync.logs")}</DeckyStoreButton>
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>
      <PanelSection title={Translator.translate("experimental.use.risk")}>
        <PanelSectionRow>
          <ToggleField
            label={Translator.translate("bidirectional.sync")}
            checked={appState.bisync_enabled}
            onChange={(e) => ApplicationState.setAppState("bisync_enabled", e, true)}
          />
        </PanelSectionRow>
      </PanelSection>
    </>
  );
};
