import { PanelSectionRow, PanelSection } from "decky-frontend-lib";
import { useEffect, useState } from "react";
import { PageProps } from "../types";
import AddNewPathButton from "../components/AddNewPathButton";
import { RenderExistingPathButton } from "../components/RenderExistingPathButton";
import Container from "../components/Container";
import { HelpAssistant } from "../components/HelpAssistant";
import { getSyncPaths } from "../apiClient";

export default function ConfigurePathsPage({ serverApi }: PageProps<{}>) {
  const [includePaths, setIncludePaths] = useState<string[] | undefined>(undefined);
  const [excludePaths, setExcludePaths] = useState<string[] | undefined>(undefined);

  const onPathsUpdated = () => {
    getSyncPaths("includes").then((p) => setIncludePaths(p));
    getSyncPaths("excludes").then((p) => setExcludePaths(p));
  };

  useEffect(() => onPathsUpdated(), []);

  return (
    <Container
      title="Sync Paths"
      help={
        <HelpAssistant
          entries={[
            {
              label: "Includes vs Excludes",
              description: "As of v1.2.0, ",
              issueId: "7",
            },
            {
              label: "File Picker loads indefinitely",
              description: "After a fresh install, the file picker sometimes fails to load. Restarting Steam fixes this.",
              issueId: "7",
            },
          ]}
        />
      }
    >
      <PanelSection title="Includes">
        <PanelSectionRow>
          <AddNewPathButton serverApi={serverApi} onPathAdded={onPathsUpdated} file="includes" />
        </PanelSectionRow>
        {includePaths?.map((p) => (
          <PanelSectionRow>
            <RenderExistingPathButton key={p} path={p} serverApi={serverApi} onPathRemoved={onPathsUpdated} file="includes" />
          </PanelSectionRow>
        ))}
      </PanelSection>
      <PanelSection title="Excludes">
        <PanelSectionRow>
          <AddNewPathButton serverApi={serverApi} onPathAdded={onPathsUpdated} file="excludes" />
        </PanelSectionRow>
        {excludePaths?.map((p) => (
          <PanelSectionRow>
            <RenderExistingPathButton key={p} path={p} serverApi={serverApi} onPathRemoved={onPathsUpdated} file="excludes" />
          </PanelSectionRow>
        ))}
      </PanelSection>
    </Container>
  );
}
