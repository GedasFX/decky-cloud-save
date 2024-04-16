import { FaSave } from "react-icons/fa";
import { getServerApi } from "./state";
import toastIcon from "../../assets/toastIcon.png";

export const pluginIcon = FaSave
const ico = window.SP_REACT.createElement("img", { width: "30", style: { marginTop: "5px", marginLeft: "10px" }, src: toastIcon });

export function log(...args: any) {
  console.log('\x1B[30;42;1m Decky Cloud Save \x1B[m '+ args);
}

export function toast(msg: any, ms: number = 2000) {
  getServerApi().toaster.toast({ title: "Decky Cloud Save", body: msg, duration: ms, logo: ico });
}

export async function backend_call<I, O>(name: string, params: I): Promise<O> {
  try {
    const res = await getServerApi().callPluginMethod<I, O>(name, params);
    if (res.success) {
      let result = res.result;
      log(name + " success: " + result)
      return result;
    } else {
      let result = res.result;
      log(name + " failure: " + result)
      throw result;
    }
  } catch (e) {
    log(e);
    throw e;
  }
}
