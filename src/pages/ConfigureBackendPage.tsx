import { ButtonItem, ConfirmModal, Navigation, PanelSection, PanelSectionRow, showModal, sleep } from "decky-frontend-lib";
import { useEffect, useState } from "react";
import { ImOnedrive, ImDropbox, ImHome, ImGoogleDrive } from "react-icons/im";
import { BsGearFill, BsPatchQuestionFill } from "react-icons/bs";
import Container from "../components/Container";
import { PageProps } from "../helpers/types";
import { getCloudBackend } from "../helpers/apiClient";
import { translate } from "../helpers/translator"
import * as logger from "../helpers/logger";

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
      logger.error(response);
    }
  };

  const [provider, setProvider] = useState<string | undefined>(undefined);

  useEffect(() => {
    getCloudBackend().then((e) => setProvider(e ?? "N/A"));
  }, []);

  return (
    <Container title={translate("configure.provider")}>
      <PanelSection>
        <strong>{translate("currently.using")}: {provider}</strong>
      </PanelSection>
      <PanelSection>
        <small>{translate("click.providers")}</small>
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
                  strTitle={translate("other.providers")}
                  strDescription={
                    <span style={{ whiteSpace: "pre-wrap" }}>
                      {
                        translate("manually.desktop")
                      }
                    </span>
                  }
                />
              )
            }
            icon={<ImHome />}
            label={translate("other.advanced")}
          >
            <BsPatchQuestionFill />
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>
    </Container>
  );
}
