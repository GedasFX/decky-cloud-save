import { ServerAPI } from "decky-frontend-lib";

export function toastError(serverApi: ServerAPI, e: any) {
  serverApi.toaster.toast({ title: "Decky Cloud Saves", body: e });
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));