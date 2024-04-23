import { ButtonItem, showContextMenu, Menu, MenuItem, FilePickerRes, showModal, ConfirmModal } from "decky-frontend-lib";
import { useState } from "react";
import { PageProps } from "../helpers/types";
import { Toast } from "../helpers/toast";
import { Translator } from "../helpers/translator"

export default function AddNewPathButton({ serverApi, onPathAdded, file }: PageProps<{ onPathAdded?: () => void; file: "includes" | "excludes" }>) {
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const onFileChosen = (res: FilePickerRes, mode: "file" | "directory" | "directory-norecurse") => {
    if (res.realpath === "/") {
      showModal(<ConfirmModal strTitle={Translator.translate("you.mad")} strDescription={Translator.translate("warning.root")} />);
      return;
    }

    setButtonDisabled(true);

    const path = mode === "directory" ? `${res.realpath}/**` : mode === "directory-norecurse" ? `${res.realpath}/*` : res.realpath;
    serverApi
      .callPluginMethod<{ path: string }, number>("test_syncpath", { path })
      .then((r) => {
        if (!r.success) {
          Toast.toast(r.result);
          setButtonDisabled(false);
          return;
        }

        showModal(
          <ConfirmModal
            strTitle={Translator.translate("confirm.add")}
            strDescription={Translator.translate("confirm.add.path", { "path": path, "count": r.result })}
            onCancel={() => setButtonDisabled(false)}
            onEscKeypress={() => setButtonDisabled(false)}
            onOK={() => {
              serverApi
                .callPluginMethod<{ path: string; file: "includes" | "excludes" }, void>("add_syncpath", { path, file })
                .then(() => {
                  if (onPathAdded) onPathAdded();
                })
                .catch((e) => Toast.toast(e))
                .finally(() => setButtonDisabled(false));
            }}
          />
        );
      })
      .catch((e) => {
        Toast.toast(e);
        setButtonDisabled(false);
      });
  };

  return (
    <ButtonItem
      // icon={<FaPlus />}
      layout="below"
      onClick={() =>
        showContextMenu(
          <Menu label={Translator.translate("select.path")}>
            <MenuItem
              onSelected={() =>
                serverApi
                  .openFilePicker("/home/deck", true)
                  .then((e) => onFileChosen(e, "file"))
                  .catch()
              }
            >
              {Translator.translate("file")}
            </MenuItem>
            <MenuItem
              onSelected={() =>
                serverApi
                  .openFilePicker("/home/deck", false)
                  .then((e) => onFileChosen(e, "directory"))
                  .catch()
              }
            >
              {Translator.translate("folder")}
            </MenuItem>
            <MenuItem
              onSelected={() =>
                serverApi
                  .openFilePicker("/home/deck", false)
                  .then((e) => onFileChosen(e, "directory-norecurse"))
                  .catch()
              }
            >
              {Translator.translate("folder.exclude")}
            </MenuItem>
          </Menu>
        )
      }
      disabled={buttonDisabled}
    >
      {file === "includes" ? Translator.translate("add.to.sync") : Translator.translate("exclude.from.sync")}
    </ButtonItem>
  );
}
