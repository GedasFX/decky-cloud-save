import { sleep } from "decky-frontend-lib";
import { getServerApi, setAppState } from "./state";

export async function syncNow(): Promise<void> {
  const start = new Date();

  setAppState("syncing", "true");
  await getServerApi().callPluginMethod("sync_now", {});

  let exitCode = 0;
  while (true) {
    const status = await getServerApi().callPluginMethod<{}, number | undefined>("sync_now_probe", {});

    if (status.success && status.result != null) {
      exitCode = status.result;
      break;
    }

    await sleep(360);
  }

  let body;
  switch (exitCode) {
    case 0:
    case 6:
      body = `Sync completed in ${(new Date().getTime() - start.getTime()) / 1000}s.`;
      break;
    default:
      body = `Sync failed. Check journalctl for errors.`;
      break;
  }

  setAppState("syncing", "false");
  getServerApi().toaster.toast({ title: "Decky Cloud Save", body });
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
