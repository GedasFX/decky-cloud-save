import { Navigation } from "decky-frontend-lib";
import Container from "../components/Container";
import { translate } from "../helpers/translator";
import { syncNow, resyncNow } from "../helpers/apiClient";
import * as storage from "../helpers/storage";
import { toast } from "../helpers/toast";


export default function ConfigurePathsPage() {
  Navigation.CloseSideMenus();
  let isHidden = storage.getSessionStorageItem("rcloneLogs")?.indexOf("Must run --resync") == -1;

  return (
    <Container title={translate("rclone.error.logs")}>
      <div style={{ maxHeight: "300px" }}>
        <pre style={{ overflowY: 'scroll', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: "smaller", maxHeight: "300px" }}>{storage.getSessionStorageItem("rcloneLogs")?.replace(/\n{2,}/g, '\n')}</pre>
      </div>
      <div>
        <button onClick={() => {
          Navigation.CloseSideMenus();
          Navigation.NavigateBack();
          toast(translate("synchronizing.savedata"))
          syncNow(true);
        }}>
          {translate("sync.now")}
        </button>
        <button hidden={isHidden} onClick={() => {
          Navigation.CloseSideMenus();
          Navigation.NavigateBack();
          let winner = "path1"
          if ((storage.getSessionStorageItem("rcloneLogs")?.indexOf("--conflict-resolve path2") !== -1)) {
            winner = "path2";
          }
          toast(translate("resynchronizing.savedata"))
          resyncNow(winner);
        }}>
          {translate("resync.now")}
        </button>
      </div>
    </Container>
  );
}
