import { ButtonItem, ConfirmModal, Navigation, PanelSection, PanelSectionRow, showModal, sleep } from "decky-frontend-lib";
import { useEffect, useState } from "react";
import { ImOnedrive, ImDropbox, ImHome } from "react-icons/im";
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

          if (res.success && res.result === 0) {
            Navigation.NavigateBack();
            break;
          }

          await sleep(360);
        }
      })();

      Navigation.CloseSideMenus();
      Navigation.NavigateToExternalWeb(response.result);
    } else {
      console.error(response);
    }
  };

  const [provider, setProvider] = useState<string | undefined>(undefined);

  useEffect(() => {
    getCloudBackend().then((e) => setProvider(e ?? "N/A"));
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
        {/* <PanelSectionRow>
          <ButtonItem
            onClick={() => openConfig("drive")}
            icon={<ImGoogleDrive />}
            label="Google Drive (may not work if Google does not trust the Steam Browser)"
          >
            <BsGearFill />
          </ButtonItem>
        </PanelSectionRow> */}
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
                  strDescription={
                    <span style={{ whiteSpace: "pre-wrap" }}>
                      {
                        "In addition to the 2 providers listed above, others can also be configured. Unfortunately, setup for them can only be done in desktop mode.\n\nSome providers (such as Google Drive) will have install scripts ready for your convenience. For those, simply run the install script found in the plugin install directory (default: /home/deck/homebrew/plugins/decky-cloud-save/quickstart/).\n\nFor all other providers read instructions found in the README.md."
                      }
                    </span>
                  }
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
