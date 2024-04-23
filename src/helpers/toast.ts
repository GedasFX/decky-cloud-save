import { ApplicationState } from "./state";
import toastIcon from "../../assets/images/toastIcon.png";

export class Toast {
  private static ico = window.SP_REACT.createElement("img", { width: "30", style: { marginTop: "5px", marginLeft: "10px" }, src: toastIcon });

  public static toast(msg: any, ms: number = 2000, clickAction = () => { }) {
    ApplicationState.getServerApi().toaster.toast({ title: "Decky Cloud Save", body: msg, duration: ms, logo: Toast.ico, onClick: clickAction });
  }
}

