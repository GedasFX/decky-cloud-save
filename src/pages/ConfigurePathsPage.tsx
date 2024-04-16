import { PanelSectionRow, PanelSection, TextField } from "decky-frontend-lib";
import { useEffect, useState } from "react";
import { PageProps } from "../helpers/types";
import AddNewPathButton from "../components/AddNewPathButton";
import { RenderExistingPathButton } from "../components/RenderExistingPathButton";
import Container from "../components/Container";
import { HelpAssistant } from "../components/HelpAssistant";
import { getSyncPaths } from "../helpers/apiClient";
import { setAppState, useAppState } from "../helpers/state";
import { translate } from "../helpers/translator";

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
      title={translate("sync.paths")}
      help={
        <HelpAssistant
          entries={[
            {
              label: translate("includes.vs.exclude"),
              description: translate("help.exclude"),
              issueId: "9",
            },
            {
              label: translate("include.or.exclude.subf"),
              description: translate("help.include.or.exclude.subf"),
              issueId: "9",
            },
            {
              label: translate("bug.file.picker"),
              description: translate("help.file.picker.fail"),
              issueId: "7",
            },
          ]}
        />
      }
    >
      <PanelSection title={translate("cloud.save.path")}>
        <TextField
          disabled={false}
          value={appState.destination_directory}
          onChange={(e) => setAppState("destination_directory", e.target.value, false)}
          onBlur={(e) => setAppState("destination_directory", e.target.value, true)} />
      </PanelSection>
      <PanelSection title={translate("includes")}>
        <PanelSectionRow>
          <AddNewPathButton serverApi={serverApi} onPathAdded={onPathsUpdated} file="includes" />
        </PanelSectionRow>
        {includePaths?.map((p) => (
          <PanelSectionRow>
            <RenderExistingPathButton key={p} path={p} serverApi={serverApi} onPathRemoved={onPathsUpdated} file="includes" />
          </PanelSectionRow>
        ))}
      </PanelSection>
      <PanelSection title={translate("excludes")}>
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
