import { ButtonItem, PanelSectionRow, ServerAPI, TextField } from "decky-frontend-lib";
import { useEffect, useState } from "react";

type PageProps = {
  serverApi: ServerAPI;
};

export default function ConfigurePage({ serverApi }: PageProps) {
  // <div style={{ marginTop: "50px", color: "white" }}>
  //   Hello World!
  //   <DialogButton onClick={() => Router.NavigateToChat()}>Go to Chat</DialogButton>
  // </div>
  const [paths, setPaths] = useState<string | undefined>(undefined);
  useEffect(() => {
    serverApi.callPluginMethod<{}, string>("get_syncpaths", {}).then((r) => {
      if (r.success) {
        setPaths(r.result);
      }
    });
  }, []);

  return (
    <PanelSectionRow>
      <TextField label="Sync paths" value={paths} />
      <ButtonItem onClick={() => {}} />
    </PanelSectionRow>
  );
}
