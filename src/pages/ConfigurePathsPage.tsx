import { PanelSectionRow, PanelSection, TextField, ToggleField } from "decky-frontend-lib";
import { useEffect, useState } from "react";
import { PageProps } from "../helpers/types";
import AddNewPathButton from "../components/AddNewPathButton";
import { RenderExistingPathButton } from "../components/RenderExistingPathButton";
import Container from "../components/Container";
import { HelpAssistant } from "../components/HelpAssistant";
import { ApiClient } from "../helpers/apiClient";
import { ApplicationState } from "../helpers/state";
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
    <div style= {{ overflow: "auto", maxHeight: "calc(100vh - 80px)" }}>
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
    <PanelSection title={Translator.translate("documents")}>
      <div style={{ display: "flex" }}>
        <div style={{ flexShrink: 0, width: "fit-content"}}>
        <ToggleField
              label={Translator.translate("enabled")}
              checked={true}/>
        </div>
        <div style={{ flexGrow: 1 }}>
        <TextField
          disabled={false}
          value={"Documents"}/>
        </div>
      </div>
    </PanelSection>
    <PanelSection title={Translator.translate("pictures")}>
      <div style={{ display: "flex" }}>
        <div style={{ flexShrink: 0, width: "fit-content"}}>
        <ToggleField
              label={Translator.translate("enabled")}
              checked={true}/>
        </div>
        <div style={{ flexGrow: 1 }}>
        <TextField
          disabled={false}
          value={"Pictures"}/>
        </div>
      </div>
    </PanelSection>
    <PanelSection title={Translator.translate("music")}>
      <div style={{ display: "flex" }}>
        <div style={{ flexShrink: 0, width: "fit-content"}}>
        <ToggleField
              label={Translator.translate("enabled")}
              checked={true}/>
        </div>
        <div style={{ flexGrow: 1 }}>
        <TextField
          disabled={false}
          value={"Music"}/>
        </div>
      </div>
    </PanelSection>
    <PanelSection title={Translator.translate("videos")}>
      <div style={{ display: "flex" }}>
        <div style={{ flexShrink: 0, width: "fit-content"}}>
        <ToggleField
              label={Translator.translate("enabled")}
              checked={true}/>
        </div>
        <div style={{ flexGrow: 1 }}>
        <TextField
          disabled={false}
          value={"Videos"}/>
        </div>
      </div>
    </PanelSection>
    </Container>
    </PanelSectionRow>
    </div>
    </PanelSection>
  );
}
