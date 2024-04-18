import { FaSave } from "react-icons/fa";
import { getServerApi } from "./state";
import toastIcon from "../../assets/toastIcon.png";

export const pluginIcon = FaSave
const ico = window.SP_REACT.createElement("img", { width: "30", style: { marginTop: "5px", marginLeft: "10px" }, src: toastIcon });

export function log(...args: any) {
  backend_call<{ msg: string }, void>("log", { msg: "" + args });
}

export function toast(msg: any, ms: number = 2000, clickAction = () => { }) {
  getServerApi().toaster.toast({ title: "Decky Cloud Save", body: msg, duration: ms, logo: ico, onClick: clickAction });
}

export async function backend_call<I, O>(name: string, params: I): Promise<O> {
  try {
    const res = await getServerApi().callPluginMethod<I, O>(name, params);
    if (res.success) {
      let result = res.result;
      return result;
    } else {
      let result = res.result;
      throw result;
    }
  } catch (e) {
    throw e;
  }
}
