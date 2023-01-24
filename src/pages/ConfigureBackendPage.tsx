import { ButtonItem, ConfirmModal, PanelSection, PanelSectionRow, Router, showModal } from "decky-frontend-lib";
import { useEffect, useState } from "react";
import { ImOnedrive, ImGoogleDrive, ImDropbox, ImHome } from "react-icons/im";
import { BsGearFill, BsPatchQuestionFill } from "react-icons/bs";
import Container from "../components/Container";
import { PageProps } from "../types";

export default function ConfigureBackendPage({ serverApi }: PageProps<{}>) {
  const openConfig = async (backend: "onedrive" | "drive" | "dropbox") => {
    await serverApi.callPluginMethod<{}, {}>("spawn_nukeall", {});
    const response = await serverApi.callPluginMethod<{ backend_type: "onedrive" | "drive" | "dropbox" }, string>("spawn", { backend_type: backend });
    if (response.success) {
      // Process hack to make sure successful subprocess exit.
      serverApi.callPluginMethod("spawn_callback", {}).then(() => Router.Navigate("/dcs-configure-backend"));

      Router.CloseSideMenus();
      Router.NavigateToExternalWeb(response.result);
    } else {
      console.error(response.result);
    }
  };

  const [provider, setProvider] = useState<string | undefined>(undefined);

  useEffect(() => {
    serverApi.callPluginMethod<{}, {}>("spawn_nukeall", {});
    serverApi.callPluginMethod<{}, string>("get_backend_type", {}).then((e) => {
      console.log(e);
      if (e.success) {
        setProvider(e.result ?? "N/A");
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

        {/* <Button
            onClick={() =>
              serverApi
                .openFilePicker("/home/deck", false)
                .then((e) => console.log(e))
                .catch((e) => console.warn(e))
            }
          >
            <GrOnedrive /> Debug
          </Button> */}
      </PanelSection>
    </Container>
  );
}
