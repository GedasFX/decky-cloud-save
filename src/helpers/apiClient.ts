import { Navigation, sleep } from "decky-frontend-lib";
import { ApplicationState } from "./state";
import { Toast } from "./toast";
import { Backend } from "./backend";
import { Translator } from "./translator";
import { Logger } from '../helpers/logger';
import { Storage } from '../helpers/storage';

/**
 * Represents an API client for handling synchronization.
 */
export class ApiClient {

  /**
   * Delete lock files and forces resync
   * @param winner - The winner of the synchronization.
   */
  public static async deleteLocksAndResync(winner: string) {
    await Backend.deleteLockFiles();
    await this.resyncNow(winner);
  }

  /**
   * Constructs a new instance of the ApiClient class.
   * @private
   */
  private constructor() { }

  /**
   * Synchronizes data immediately.
   * @param showToast - Whether to show toast notifications.
   * @returns A Promise that resolves when synchronization is complete.
   */
  public static async syncNow(showToast: boolean): Promise<void> {
    return ApiClient.syncNowInternal(showToast, "path1");
  }

  /**
   * Synchronizes data immediately and forces a full resync.
   * @param winner - The winner of the synchronization.
   * @returns A Promise that resolves when synchronization is complete.
   */
  public static async resyncNow(winner: string): Promise<void> {
    return ApiClient.syncNowInternal(true, winner, true);
  }

  /**
   * Synchronizes data immediately and is triggered on application launch.
   * @param showToast - Whether to show toast notifications.
   * @param pid - The process ID.
   * @returns A Promise that resolves when synchronization is complete.
   */
  public static async syncOnLaunch(showToast: boolean, pid: number): Promise<void> {
    Logger.info("Pausing game")
    await Backend.signal(pid, 'SIGSTOP');
    await ApiClient.syncNowInternal(showToast, "path2");
    Logger.info("Resuming game")
    await Backend.signal(pid, 'SIGCONT');
  }

  /**
   * Synchronizes data immediately and is triggered on application end.
   * @param showToast - Whether to show toast notifications.
   * @returns A Promise that resolves when synchronization is complete.
   */
  public static async syncOnEnd(showToast: boolean): Promise<void> {
    return ApiClient.syncNowInternal(showToast, "path1");
  }

  /**
   * Retrieves the cloud backend type.
   * @returns A string representing the cloud backend type.
   */
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

  /**
   * Retrieves synchronization paths.
   * @param file - The type of file.
   * @returns An array of synchronization paths.
   */
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

  /**
   * Internal method for synchronizing data.
   * @param showToast - Whether to show toast notifications.
   * @param winner - The winner of the synchronization.
   * @param resync - Whether to force a full resync.
   * @returns A Promise that resolves when synchronization is complete.
   */
  private static async syncNowInternal(showToast: boolean, winner: string, resync: boolean = false): Promise<void> {
    Logger.info("Synchronizing");
    const start = new Date();
    if (ApplicationState.getAppState().currentState.syncing === "true") {
      Toast.toast(Translator.translate("waiting.previous"), 2000);
      while (ApplicationState.getAppState().currentState.syncing === "true") {
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
    let action = () => { Navigation.Navigate("/dcs-sync-logs"); };

    const syncLogs = await Backend.getLastSyncLog();
    Storage.setSessionStorageItem("syncLogs", syncLogs);

    if (pass) {
      body = Translator.translate("sync.completed", { "time": timeDiff });
    } else {
      body = Translator.translate("sync.failed");
      time = 15000;
    }

    if (showToast || (!pass)) {
      Toast.toast(body, time, action);
    }

    // Additional check for if there were any conflicts.
    if (syncLogs.match(/Moved \(server-side\) to: .*\.conflict\d*/)) {
      Toast.toast(Translator.translate("sync.conflict"), 5000, () => { Navigation.Navigate("/dcs-sync-logs"); })
    }
  }
}
