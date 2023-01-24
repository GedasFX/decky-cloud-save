import { ServerAPI } from "decky-frontend-lib";

export async function startSync(serverApi: ServerAPI): Promise<void> {
  const start = new Date();

  await serverApi.callPluginMethod("sync_now", {});

  serverApi.toaster.toast({ title: "Decky Cloud Save", body: `Sync completed in ${(new Date().getTime() - start.getTime()) / 1000}s.` });
}
