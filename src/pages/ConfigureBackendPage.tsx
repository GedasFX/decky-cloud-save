import { ButtonItem, ConfirmModal, PanelSection, PanelSectionRow, Router, showModal, sleep } from "decky-frontend-lib";
import { useEffect, useState } from "react";
import { ImOnedrive, ImGoogleDrive, ImDropbox, ImHome } from "react-icons/im";
import { BsGearFill, BsPatchQuestionFill } from "react-icons/bs";
import Container from "../components/Container";
import { PageProps } from "../types";

export default function ConfigureBackendPage({ serverApi }: PageProps<{}>) {
  const openConfig = async (backend: "onedrive" | "drive" | "dropbox") => {
    // await serverApi.callPluginMethod<{}, {}>("spawn_nukeall", {});
    const response = await serverApi.callPluginMethod<{ backend_type: "onedrive" | "drive" | "dropbox" }, string>("spawn", { backend_type: backend });
    console.log("respones", response);
    if (response.success) {
      // Process hack to make sure successful subprocess exit.
      (async () => {
        let count = 0; // For timeout in case user forgor 💀
        while (count < 10_000 /* approx 1h */) {
          const res = await serverApi.callPluginMethod<{}, number | undefined>("spawn_probe", {});
          console.log("callback", res);

          if (res.success && res.result === 0) {
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
    serverApi.callPluginMethod<{}, string>("get_backend_type", {}).then((e) => {
      console.log(e);
      if (e.success) {
        switch (e.result) {
          case "type = onedrive":
            setProvider("OneDrive");
            break;
          case "type = drive":
            setProvider("Google Drive");
            break;
          case "type = dropbox":
            setProvider("Dropbox");
            break;
          case undefined:
            setProvider("N/A");
            break;
          default:
            setProvider("Other: " + e.result);
            break;
        }
      } else {
        setProvider("N/A");
      }
    });
  }, []);

  return (
    <Container title="Configure Cloud Destination">
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
          <ButtonItem onClick={() => openConfig("drive")} icon={<ImGoogleDrive />} label="Google Drive">
            <BsGearFill />
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem onClick={() => openConfig("dropbox")} icon={<ImDropbox />} label="Dropbox">
            <BsGearFill />
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem onClick={() => showModal(<ConfirmModal />)} icon={<ImHome />} label="Other (Advanced)">
            <BsPatchQuestionFill />
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>
    </Container>
  );
}
