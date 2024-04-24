import { Navigation } from "decky-frontend-lib";
import Container from "../components/Container";
import { Translator } from "../helpers/translator";
import { ApiClient } from "../helpers/apiClient";
import { Storage } from "../helpers/storage";
import { Toast } from "../helpers/toast";


export default function RenderSyncErrorLogPage() {
  Navigation.CloseSideMenus();
  const resyncNeeded = !(Storage.getSessionStorageItem("rcloneLogs")?.indexOf("Must run --resync") == -1);
  const deleteLockNeeded =  !(Storage.getSessionStorageItem("rcloneLogs")?.indexOf("rclone deletefile") == -1);

  return (
    <Container title={Translator.translate("rclone.error.logs")}>
      <div style={{ maxHeight: "300px" }}>
        <pre style={{ overflowY: 'scroll', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: "smaller", maxHeight: "300px" }}>{Storage.getSessionStorageItem("syncLogs")?.replace(/\n{2,}/g, '\n')}</pre>
      </div>
      <div>
        <button hidden={deleteLockNeeded || resyncNeeded} onClick={() => {
          Navigation.CloseSideMenus();
          Navigation.NavigateBack();
          Toast.toast(Translator.translate("synchronizing.savedata"))
          ApiClient.syncNow(true);
        }}>
          {Translator.translate("sync.now")}
        </button>
        <button hidden={!resyncNeeded || deleteLockNeeded} style={{ marginLeft: "10px" }} onClick={() => {
          Navigation.CloseSideMenus();
          Navigation.NavigateBack();
          let winner = "path1"
          if ((Storage.getSessionStorageItem("rcloneLogs")?.indexOf("--conflict-resolve path2") !== -1)) {
            winner = "path2";
          }
          Toast.toast(Translator.translate("resynchronizing.savedata"))
          ApiClient.resyncNow(winner);
        }}>
          {Translator.translate("resync.now")}
        </button>
        <button hidden={!deleteLockNeeded} style={{ marginLeft: "10px" }} onClick={() => {
          Navigation.CloseSideMenus();
          Navigation.NavigateBack();
          let winner = "path1"
          if ((Storage.getSessionStorageItem("rcloneLogs")?.indexOf("--conflict-resolve path2") !== -1)) {
            winner = "path2";
          }
          Toast.toast(Translator.translate("deleting.locks.sync"))
          ApiClient.deleteLocksAndResync(winner);
        }}>
          {Translator.translate("delete.locks")}
        </button>
      </div>
    </Container>
  );
}
