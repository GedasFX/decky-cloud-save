import { Button, Router, ButtonItem, PanelSectionRow, PanelSection } from "decky-frontend-lib";
import { useEffect, useState } from "react";
import { FaFile, FaFolder, FaTrash } from "react-icons/fa";
import { GrOnedrive } from "react-icons/gr";
import { ButtonPlayground } from "../ButtonPlayground";
import { PageProps } from "../types";
import AddNewPathButton from "../components/AddNewPathButton";

function ConfigureSection({ serverApi }: PageProps<{}>) {
  const openConfig = async (backend: "onedrive") => {
    const response = await serverApi.callPluginMethod<{ backend_type: "onedrive" }, string>("spawn", { backend_type: backend });
    if (response.success) {
      // Process hack to make sure successful subprocess exit.
      serverApi.callPluginMethod("spawn_callback", {}).then(() => Router.Navigate("/dcs-configure"));

      Router.CloseSideMenus();
      Router.NavigateToExternalWeb(response.result);
    } else {
      console.error(response.result);
    }
  };

  return (
    <div>
      <h2>Configure back-end</h2>
      <small>Click one of the buttons below to configure the sync destination.</small>
      <div style={{ marginLeft: "0.5em", marginRight: "0.5em" }}>
        <Button onClick={() => openConfig("onedrive")}>
          <GrOnedrive /> OneDrive
        </Button>

        <Button
          onClick={() =>
            serverApi
              .openFilePicker("/home/deck", false)
              .then((e) => console.log(e))
              .catch((e) => console.warn(e))
          }
        >
          <GrOnedrive /> Debug
        </Button>
      </div>
    </div>
  );
}

function SyncPathsSection({ serverApi }: PageProps<{}>) {
  const [paths, setPaths] = useState<string[] | undefined>(undefined);

  const onPathsUpdated = () => {
    serverApi.callPluginMethod<{}, string>("get_syncpaths", {}).then((r) => {
      if (r.success) {
        setPaths(r.result.split("\n"));
      }
    });
  };

  useEffect(onPathsUpdated, []);

  return (
    <div>
      <h2>Sync Paths</h2>
      <small>To update paths to sync, switch to desktop mode and edit</small> <code>/home/deck/homebrew/plugins/decky-cloud-save/syncpaths.txt</code>
      <div>
        <h4 style={{ marginBottom: "0.25em" }}>Active Paths:</h4>
        <PanelSection>
          <PanelSectionRow>
            <AddNewPathButton serverApi={serverApi} onPathAdded={onPathsUpdated} />
          </PanelSectionRow>
          {paths?.map((p, i) => (
            <PanelSectionRow>
              <ButtonItem key={i} icon={p.endsWith("**") ? <FaFolder /> : <FaFile />} label={p}>
                <FaTrash />
              </ButtonItem>
            </PanelSectionRow>
          ))}
        </PanelSection>
      </div>
    </div>
  );
}

export default function ConfigurePage({ serverApi }: PageProps<{}>) {
  return (
    <div style={{ margin: "1em" }}>
      <ConfigureSection serverApi={serverApi} />
      <SyncPathsSection serverApi={serverApi} />
    </div>
  );
}
