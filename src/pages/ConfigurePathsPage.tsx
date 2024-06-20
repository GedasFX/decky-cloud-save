import { PanelSectionRow, PanelSection, TextField, ToggleField } from "decky-frontend-lib";
import { useEffect, useState } from "react";
import { PageProps } from "../helpers/types";
import AddNewPathButton from "../components/AddNewPathButton";
import { RenderExistingPathButton } from "../components/RenderExistingPathButton";
import Container from "../components/Container";
import { HelpAssistant } from "../components/HelpAssistant";
import { ApiClient } from "../helpers/apiClient";
import { ApplicationState, LibrarySyncState } from "../helpers/state";
import { Translator } from "../helpers/translator";

export default function ConfigurePathsPage({ serverApi }: PageProps<{}>) {
  const appState = ApplicationState.useAppState();

  const [includePaths, setIncludePaths] = useState<string[] | undefined>(undefined);
  const [excludePaths, setExcludePaths] = useState<string[] | undefined>(undefined);

  const onPathsUpdated = () => {
    (async () => {
      await ApiClient.getSyncPaths("includes").then((p) => setIncludePaths(p));
      await ApiClient.getSyncPaths("excludes").then((p) => setExcludePaths(p));
    })();
  };

  useEffect(() => onPathsUpdated(), []);

  return (
    <PanelSection>
    <div style= {{ overflow: "auto", marginTop: "40px",maxHeight: "calc(100vh - 80px)" }}>
    <PanelSectionRow>
    <Container
      title={Translator.translate("sync.paths")}
      help={
        <HelpAssistant
          entries={[
            {
              label: Translator.translate("includes.vs.exclude"),
              description: Translator.translate("help.exclude"),
              issueId: "9",
            },
            {
              label: Translator.translate("include.or.exclude.subf"),
              description: Translator.translate("help.include.or.exclude.subf"),
              issueId: "9",
            },
            {
              label: Translator.translate("bug.file.picker"),
              description: Translator.translate("help.file.picker.fail"),
              issueId: "7",
            },
          ]}
        />
      }
    >
      <PanelSection title={Translator.translate("cloud.save.path")}>
        <TextField
          disabled={false}
          value={appState.destination_directory}
          onChange={(e) => ApplicationState.setAppState("destination_directory", e.target.value, false)}
          onBlur={(e) => ApplicationState.setAppState("destination_directory", e.target.value, true)} />
      </PanelSection>
      <PanelSection title={Translator.translate("includes")}>
        <PanelSectionRow>
          <AddNewPathButton serverApi={serverApi} onPathAdded={onPathsUpdated} file="includes" />
        </PanelSectionRow>
        {includePaths?.map((p) => (
          <PanelSectionRow>
            <RenderExistingPathButton key={p} path={p} serverApi={serverApi} onPathRemoved={onPathsUpdated} file="includes" />
          </PanelSectionRow>
        ))}
      </PanelSection>
      <PanelSection title={Translator.translate("excludes")}>
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
    </PanelSectionRow>
    <PanelSectionRow>
    <Container title={Translator.translate("library.sync")}>
      <LibrarySyncEntry title={"documents"} stateKey="Documents"/>
      <LibrarySyncEntry title={"music"} stateKey="Music"/>
      <LibrarySyncEntry title={"pictures"} stateKey="Pictures"/>
      <LibrarySyncEntry title={"video"} stateKey="Videos"/>
    </Container>
    </PanelSectionRow>
    </div>
    </PanelSection>
  );

  interface LibrarySyncEntryProps {
    title: string;
    stateKey: keyof LibrarySyncState;
  }

  function LibrarySyncEntry({ title, stateKey }: LibrarySyncEntryProps) {
    return (
      <PanelSection title={Translator.translate(title)}>
        <div style={{ display: "flex" }}>
          <div style={{ display: "flex", flexShrink: 0, width: "fit-content"}}>
            <ToggleField
              label={Translator.translate("enabled")}
              checked={appState.library_sync[stateKey].enabled}
              onChange={(e) => ApplicationState.setLibSyncState(stateKey, {enabled: e}, true)}/>
            <ToggleField
              label={Translator.translate("bidirectional.sync")}
              disabled={!appState.library_sync[stateKey].enabled}
              checked={appState.library_sync[stateKey].bisync}
              onChange={(e) => ApplicationState.setLibSyncState(stateKey, {bisync: e}, true)}/>
          </div>
          <div style={{ flexGrow: 1 }}>
            <TextField
              disabled={!appState.library_sync[stateKey].enabled}
              defaultValue={appState.library_sync[stateKey].destination}
              onBlur={(e) => ApplicationState.setLibSyncState(stateKey, {destination: e.target.value}, true)}/>
          </div>
        </div>
      </PanelSection>
    );
  }
}
