import { ServerAPI, Button, Router } from "decky-frontend-lib";
import { useEffect, useState } from "react";
import { GrOnedrive } from "react-icons/gr";

type PageProps = {
  serverApi: ServerAPI;
};

function ConfigureSection({ serverApi }: PageProps) {
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

function SyncPathsSection({ serverApi }: PageProps) {
  const [paths, setPaths] = useState<string | undefined>(undefined);
  useEffect(() => {
    serverApi.callPluginMethod<{}, string>("get_syncpaths", {}).then((r) => {
      if (r.success) {
        setPaths(r.result);
      }
    });
  }, []);

  return (
    <div>
      <h2>Sync Paths</h2>
      <small>To update paths to sync, switch to desktop mode and edit</small> <code>/home/deck/homebrew/plugins/decky-cloud-save/syncpaths.txt</code>
      <div>
        <h4 style={{ marginBottom: "0.25em" }}>Active Paths:</h4>
        <code style={{ whiteSpace: "pre", overflow: "auto", display: "block", lineHeight: "0.5rem", padding: "0.25em", background: "rgba(0,0,0,0.2)" }}>
          {paths}
        </code>
      </div>
    </div>
  );
}

export default function ConfigurePage({ serverApi }: PageProps) {
  return (
    <div style={{ margin: "1em" }}>
      <ConfigureSection serverApi={serverApi} />
      <SyncPathsSection serverApi={serverApi} />
    </div>
  );
}
