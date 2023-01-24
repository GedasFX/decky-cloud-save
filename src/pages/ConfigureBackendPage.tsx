import { ButtonItem, ConfirmModal, Navigation, PanelSection, PanelSectionRow, Router, showModal, sleep } from "decky-frontend-lib";
import { useEffect, useState } from "react";
import { ImOnedrive, ImGoogleDrive, ImDropbox, ImHome } from "react-icons/im";
import { BsGearFill, BsPatchQuestionFill } from "react-icons/bs";
import Container from "../components/Container";
import { PageProps } from "../types";
import { getCloudBackend } from "../apiClient";

export default function ConfigureBackendPage({ serverApi }: PageProps<{}>) {
  const openConfig = async (backend: "onedrive" | "drive" | "dropbox") => {
    const response = await serverApi.callPluginMethod<{ backend_type: "onedrive" | "drive" | "dropbox" }, string>("spawn", { backend_type: backend });
    if (response.success) {
      // Process hack to make sure successful subprocess exit.
      (async () => {
        let count = 0; // For timeout in case user forgor 💀
        while (count < 10_000 /* approx 1h */) {
          const res = await serverApi.callPluginMethod<{}, number | undefined>("spawn_probe", {});
          console.log("callback", res);

          if (res.success && res.result === 0) {
            Navigation.
            Router.Navigate("/dcs-configure-backend");
            break;
          }

          await sleep(360);
        }
      })();

      Router.CloseSideMenus();
      Router.NavigateToExternalWeb(response.result);
    } else {
      console.error(response);
    }
  };

  const [provider, setProvider] = useState<string | undefined>(undefined);

  useEffect(() => {
    getCloudBackend(serverApi).then((e) => setProvider(e ?? "N/A"));
  }, []);

  return (
    <Container title="Configure Cloud Storage Provider">
      <PanelSection>
        <strong>Currently using: {provider}</strong>
      </PanelSection>
      <PanelSection>
        <small>Click one of the providers below to configure the backup destination.</small>
        <PanelSectionRow>
          <ButtonItem onClick={() => openConfig("onedrive")} icon={<ImOnedrive />} label="OneDrive">
            <BsGearFill />
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem
            onClick={() => openConfig("drive")}
            icon={<ImGoogleDrive />}
            label="Google Drive (may not work if Google does not trust the Steam Browser)"
          >
            <BsGearFill />
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem onClick={() => openConfig("dropbox")} icon={<ImDropbox />} label="Dropbox">
            <BsGearFill />
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem
            onClick={() =>
              showModal(
                <ConfirmModal
                  strTitle="Adding other providers"
                  strDescription="In addition to the 3 providers listed above, you can configure other providers (backends). Unfortunately, setup for those providers must be done via desktop mode. Instructions for such task can be found on the plugin install directory (default: /home/deck/homebrew/plugins/decky-cloud-save/README_CUSTOM_BACKEND.txt)."
                />
              )
            }
            icon={<ImHome />}
            label="Other (Advanced)"
          >
            <BsPatchQuestionFill />
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>
    </Container>
  );
}
