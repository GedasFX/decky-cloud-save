import { FaSave } from "react-icons/fa";
import { getServerApi } from "./state";
import toastIcon from "../../assets/toastIcon.png";

export const pluginIcon = FaSave
const ico = window.SP_REACT.createElement("img", { width: "30", style: { marginTop: "5px", marginLeft: "10px" }, src: toastIcon });

export function toast(msg: any, ms: number = 2000, clickAction = () => { }) {
  getServerApi().toaster.toast({ title: "Decky Cloud Save", body: msg, duration: ms, logo: ico, onClick: clickAction });
}
