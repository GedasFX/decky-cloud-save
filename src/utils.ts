import { getServerApi } from "./state";

export function toastError(e: any) {
  getServerApi().toaster.toast({ title: "Decky Cloud Saves", body: e });
}

