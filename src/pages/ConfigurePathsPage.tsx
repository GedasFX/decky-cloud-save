import { PanelSectionRow, PanelSection } from "decky-frontend-lib";
import { useEffect, useState } from "react";
import { PageProps } from "../types";
import AddNewPathButton from "../components/AddNewPathButton";
import { toastError } from "../utils";
import { RenderExistingPathButton } from "../components/RenderExistingPathButton";
import Container from "../components/Container";
import { HelpAssistant } from "../components/HelpAssistant";

export default function ConfigurePathsPage({ serverApi }: PageProps<{}>) {
  const [paths, setPaths] = useState<string[] | undefined>(undefined);

  const onPathsUpdated = () => {
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
    <Container
      title="Sync Paths"
      help={
        <HelpAssistant
          entries={[
            {
              label: "File Picker loads indefinitely",
              description: "After a fresh install, the file picker sometimes fails to load. Restarting Steam fixes this.",
              issueId: "7",
            },
          ]}
        />
      }
    >
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
    </Container>
  );
}
