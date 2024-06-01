import { Navigation } from "decky-frontend-lib";
import Container from "../components/Container";
import { Translator } from "../helpers/translator";
import { Storage } from "../helpers/storage";


export default function RenderSyncLogPage() {
  Navigation.CloseSideMenus();

  return (
    <Container title={Translator.translate("sync.logs")}>
      <div style={{ maxHeight: "300px" }}>
        <pre style={{ overflowY: 'scroll', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: "smaller", maxHeight: "300px" }}>{Storage.getSessionStorageItem("syncLogs")?.replace(/\n{2,}/g, '\n')}</pre>
      </div>
    </Container>
  );
}
