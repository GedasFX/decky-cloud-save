import { PanelSectionRow, PanelSection, TextField } from "decky-frontend-lib";
import { useEffect, useState } from "react";
import { PageProps } from "../types";
import AddNewPathButton from "../components/AddNewPathButton";
import { RenderExistingPathButton } from "../components/RenderExistingPathButton";
import Container from "../components/Container";
import { HelpAssistant } from "../components/HelpAssistant";
import { getSyncPaths } from "../apiClient";
import { setAppState, useAppState } from "../state";

export default function ConfigurePathsPage({ serverApi }: PageProps<{}>) {
  const appState = useAppState();
  const [includePaths, setIncludePaths] = useState<string[] | undefined>(undefined);
  const [excludePaths, setExcludePaths] = useState<string[] | undefined>(undefined);

  const onPathsUpdated = () => {
    (async () => {
      await getSyncPaths("includes").then((p) => setIncludePaths(p));
      await getSyncPaths("excludes").then((p) => setExcludePaths(p));
    })();
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
              description: "As of v1.2.0, it is possible to exclude certain folders from sync.\n\nDuring sync, the plugin first looks at the excludes list to see if a file (or folder) is not excluded, and only then it checks for files in the included list.\n\nFor example, if folder /a/** is included, but file /a/b is excluded, all files except for b would be backed up.",
              issueId: "9",
            },
            {
              label: "Include or exclude subfolders",
              description: "There may be cases where it is necessary to only back up a folder without recursively digging deeper into subfolders. For those cases you can use option 'Folder (exclude subfolders)'.\n\nSuch cases are quite niche; in general the 'Folder' option should be used instead.",
              issueId: "9",
            },
            {
              label: "Bug: File Picker loads indefinitely",
              description: "After a fresh install, the file picker sometimes fails to load. Restarting Steam fixes this.\nSee more details for the discussion.",
              issueId: "7",
            },
          ]}
        />
      }
    >
      <PanelSection title="Cloud Save Path">
        <TextField
          disabled={false}
          value={appState.destination_directory}
          onChange={(e) => setAppState("destination_directory", e.target.value, false)}
          onBlur={(e) => setAppState("destination_directory", e.target.value, true)} />
      </PanelSection>
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
