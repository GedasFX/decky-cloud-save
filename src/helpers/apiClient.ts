import { Navigation, sleep } from "decky-frontend-lib";
import { ApplicationState } from "./state";
import { Toast } from "./toast";
import { Backend } from "./backend";
import { Translator } from "./translator";
import { Logger } from '../helpers/logger';
import { Storage } from '../helpers/storage';
import { Processes } from "./processes";

export class ApiClient {
  public static async syncNowInternal(showToast: boolean, winner: string, resync: boolean = false): Promise<void> {
    Logger.info("Synchronizing")
    const start = new Date();
    if (Storage.getSessionStorageItem("syncing") === "true") {
      Toast.toast(Translator.translate("waiting.previous"), 2000);
      while (Storage.getSessionStorageItem("syncing") === "true") {
        await sleep(300);
      }
    }

    Storage.setSessionStorageItem("syncing", "true");
    ApplicationState.setAppState("syncing", "true");
    await ApplicationState.getServerApi().callPluginMethod("sync_now_internal", { winner, resync });

    let exitCode = 0;
    while (true) {
      const status = await ApplicationState.getServerApi().callPluginMethod<{}, number | undefined>("sync_now_probe", {});

      if (status.success && status.result != null) {
        exitCode = status.result;
        break;
      }

      await sleep(360);
    }

    const timeDiff = ((new Date().getTime() - start.getTime()) / 1000);
    Logger.info("Sync finished in " + timeDiff + "s");

    let pass;
    switch (exitCode) {
      case 0:
      case 6:
        pass = true;
        break;
      default:
        pass = false;
        break;
    }
    ApplicationState.setAppState("syncing", "false");
    Storage.setSessionStorageItem("syncing", "false");

    let body;
    let time = 2000;
    let action = () => { };
    Storage.setSessionStorageItem("syncLogs", await Backend.backend_call<{}, string>("getLastSyncLog", {}));
    if (pass) {
      body = Translator.translate("sync.completed", { "time": timeDiff });
      action = () => { Navigation.Navigate("/dcs-sync-logs") };
    } else {
      body = Translator.translate("sync.failed");
      time = 5000;
      action = () => { Navigation.Navigate("/dcs-error-sync-logs") };
    }

    if (showToast || (!pass)) {
      Toast.toast(body, time, action);
    }
  }

  public static async resyncNow(winner: string): Promise<void> {
    return ApiClient.syncNowInternal(true, winner, true)
  }

  public static async syncNow(showToast: boolean): Promise<void> {
    return ApiClient.syncNowInternal(showToast, "path1")
  }

  public static async syncOnLaunch(showToast: boolean, pid: number) {
    await Processes.signal(pid, 'SIGSTOP');
    await ApiClient.syncNowInternal(showToast, "path2")
    await Processes.signal(pid, 'SIGCONT');
  }

  public static async syncOnEnd(showToast: boolean) {
    return ApiClient.syncNowInternal(showToast, "path1")
  }

  public static async getCloudBackend(): Promise<string | undefined> {
    const e = await ApplicationState.getServerApi().callPluginMethod<{}, string>("get_backend_type", {});
    if (e.success) {
      switch (e.result) {
        case "type = onedrive\n":
          return "OneDrive";
        case "type = drive\n":
          return "Google Drive";
        case "type = dropbox\n":
          return "Dropbox";
        case undefined:
          return undefined;
        default:
          return "Other: " + e.result;
      }
    } else {
      return undefined;
    }
  }

  public static async getSyncPaths(file: "includes" | "excludes") {
    return ApplicationState.getServerApi()
      .callPluginMethod<{ file: "includes" | "excludes" }, string[]>("get_syncpaths", { file })
      .then((r) => {
        if (r.success) {
          if (r.result.length === 0) {
            return [];
          }

          r.result.sort();
          while (r.result[0] === "\n") {
            r.result = r.result.slice(1);
          }

          return r.result.map((r) => r.trimEnd());
        } else {
          Toast.toast(r.result);
          return [];
        }
      });
  }
}
