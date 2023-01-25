import { getServerApi, setAppState } from "./state";

export async function syncNow(): Promise<void> {
  const start = new Date();

  setAppState("syncing", "true");
  await getServerApi().callPluginMethod("sync_now", {});
  setAppState("syncing", "false");

  getServerApi().toaster.toast({ title: "Decky Cloud Save", body: `Sync completed in ${(new Date().getTime() - start.getTime()) / 1000}s.` });
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
