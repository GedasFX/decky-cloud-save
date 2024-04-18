import { Navigation } from "decky-frontend-lib";
import Container from "../components/Container";
import { translate } from "../helpers/translator";
import { syncNow, resyncNow } from "../helpers/apiClient";


export default function ConfigurePathsPage() {
  Navigation.CloseSideMenus();
  let isHidden = sessionStorage.getItem("rcloneLogs")?.indexOf("Must run --resync") == -1;

  return (
    <Container title={translate("rclone.error.logs")}>
      <div style={{ maxHeight: "300px" }}>
        <pre style={{ overflowY: 'scroll', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: "smaller", maxHeight: "300px" }}>{sessionStorage.getItem("rcloneLogs")?.replace(/\n{2,}/g, '\n')}</pre>
      </div>
      <div>
        <button hidden={isHidden} onClick={() => {
          Navigation.CloseSideMenus();
          Navigation.NavigateBack();
          syncNow(true);
        }}>
          {translate("sync.now")}
        </button>
        <button hidden={isHidden} onClick={() => {
          Navigation.CloseSideMenus();
          Navigation.NavigateBack();
          let winner = "path1"
          if ((sessionStorage.getItem("rcloneLogs")?.indexOf("--conflict-resolve path2") !== -1)) {
            winner = "path2";
          }
          resyncNow(winner);
        }}>
          {translate("resync.now")}
        </button>
      </div>
    </Container>
  );
}
