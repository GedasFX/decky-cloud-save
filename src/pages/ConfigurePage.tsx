import { Button, Router, PanelSectionRow, PanelSection } from "decky-frontend-lib";
import { useEffect, useState } from "react";
import { GrOnedrive } from "react-icons/gr";
import { PageProps } from "../types";
import AddNewPathButton from "../components/AddNewPathButton";
import { toastError } from "../utils";
import { RenderExistingPathButton } from "../components/RenderExistingPathButton";

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
    console.log("Updating");
    serverApi.callPluginMethod<{}, string[]>("get_syncpaths", {}).then((r) => {
      if (r.success) {
        if (r.result.length === 0) {
          setPaths([]);
          return;
        }

        r.result.sort();
        while (r.result[0] === "\n") {
          r.result = r.result.slice(1);
        }

        setPaths(r.result.map((r) => r.trimEnd()));
      } else {
        toastError(serverApi, r.result);
      }
    });
  };

  useEffect(() => onPathsUpdated(), []);

  return (
    <div>
      <h2>Sync Paths</h2>
      <PanelSection>
        <PanelSectionRow>
          <AddNewPathButton serverApi={serverApi} onPathAdded={onPathsUpdated} />
        </PanelSectionRow>
        {paths?.map((p) => (
          <PanelSectionRow>
            <RenderExistingPathButton key={p} path={p} serverApi={serverApi} onPathRemoved={onPathsUpdated} />
          </PanelSectionRow>
        ))}
      </PanelSection>
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
