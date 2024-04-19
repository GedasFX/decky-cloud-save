import { Navigation, sleep } from "decky-frontend-lib";
import { getServerApi, setAppState } from "./state";
import { toast } from "./toast";
import { backend_call } from "./backend";
import { suspendGame, resumeGame } from "./processes";
import { translate } from "./translator";
import * as logger from '../helpers/logger';
import * as storage from '../helpers/storage';

async function syncNowInternal(showToast: boolean, winner: string, resync: boolean = false): Promise<void> {
  const start = new Date();
  if (storage.getSessionStorageItem("syncing") === "true") {
    toast(translate("waiting.previous"), 2000);
    while (storage.getSessionStorageItem("syncing") === "true") {
      await sleep(300);
    }
  }

  storage.setSessionStorageItem("syncing", "true");
  setAppState("syncing", "true");
  await getServerApi().callPluginMethod("sync_now_internal", { winner, resync });

  let exitCode = 0;
  while (true) {
    const status = await getServerApi().callPluginMethod<{}, number | undefined>("sync_now_probe", {});

    if (status.success && status.result != null) {
      exitCode = status.result;
      break;
    }

    await sleep(360);
  }

  logger.info("Sync finished")

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
  setAppState("syncing", "false");
  storage.setSessionStorageItem("syncing", "false");

  let body;
  let time = 2000;
  let action = () => { };
  if (pass) {
    body = translate("sync.completed", { "time": ((new Date().getTime() - start.getTime()) / 1000) });
  } else {
    body = translate("sync.failed");
    time = 5000;
    action = () => { Navigation.Navigate("/dcs-configure-logs") };
    storage.setSessionStorageItem("rcloneLogs", await backend_call<{}, string>("getLastSyncLog", {}));
  }

  if (showToast || (!pass)) {
    toast(body, time, action);
  }
}

export async function resyncNow(winner: string): Promise<void> {
  return syncNowInternal(true, winner, true)
}

export async function syncNow(showToast: boolean): Promise<void> {
  return syncNowInternal(showToast, "path1")
}

export async function syncOnLaunch(showToast: boolean, pid: number) {
  await suspendGame(pid);
  await syncNowInternal(showToast, "path2")
  await resumeGame(pid);
}

export async function syncOnEnd(showToast: boolean) {
  return syncNowInternal(showToast, "path1")
}

export async function getCloudBackend(): Promise<string | undefined> {
  const e = await getServerApi().callPluginMethod<{}, string>("get_backend_type", {});
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

export async function getSyncPaths(file: "includes" | "excludes") {
  return getServerApi()
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
        toast(r.result);
        return [];
      }
    });
}
