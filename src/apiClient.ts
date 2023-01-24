import { ServerAPI } from "decky-frontend-lib";

export async function syncNow(serverApi: ServerAPI): Promise<void> {
  const start = new Date();

  await serverApi.callPluginMethod("sync_now", {});

  serverApi.toaster.toast({ title: "Decky Cloud Save", body: `Sync completed in ${(new Date().getTime() - start.getTime()) / 1000}s.` });
}

export async function getCloudBackend(serverApi: ServerAPI): Promise<string | undefined> {
  const e = await serverApi.callPluginMethod<{}, string>("get_backend_type", {});
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
