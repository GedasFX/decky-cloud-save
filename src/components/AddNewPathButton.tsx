import { ButtonItem, showContextMenu, Menu, MenuItem, FilePickerRes, showModal, ConfirmModal } from "decky-frontend-lib";
import { useState } from "react";
import { PageProps } from "../helpers/types";
import { toast } from "../helpers/toast";
import { translate } from "../helpers/translator"

export default function AddNewPathButton({ serverApi, onPathAdded, file }: PageProps<{ onPathAdded?: () => void; file: "includes" | "excludes" }>) {
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const onFileChosen = (res: FilePickerRes, mode: "file" | "directory" | "directory-norecurse") => {
    if (res.realpath === "/") {
      showModal(<ConfirmModal strTitle={translate("you.mad")} strDescription={translate("warning.root")} />);
      return;
    }

    setButtonDisabled(true);

    const path = mode === "directory" ? `${res.realpath}/**` : mode === "directory-norecurse" ? `${res.realpath}/*` : res.realpath;
    serverApi
      .callPluginMethod<{ path: string }, number>("test_syncpath", { path })
      .then((r) => {
        if (!r.success) {
          toast(r.result);
          setButtonDisabled(false);
          return;
        }

        showModal(
          <ConfirmModal
            strTitle={translate("confirm.add")}
            strDescription={translate("confirm.add.path", { "path": path, "count": r.result })}
            onCancel={() => setButtonDisabled(false)}
            onEscKeypress={() => setButtonDisabled(false)}
            onOK={() => {
              serverApi
                .callPluginMethod<{ path: string; file: "includes" | "excludes" }, void>("add_syncpath", { path, file })
                .then(() => {
                  if (onPathAdded) onPathAdded();
                })
                .catch((e) => toast(e))
                .finally(() => setButtonDisabled(false));
            }}
          />
        );
      })
      .catch((e) => {
        toast(e);
        setButtonDisabled(false);
      });
  };

  return (
    <ButtonItem
      // icon={<FaPlus />}
      layout="below"
      onClick={() =>
        showContextMenu(
          <Menu label={translate("select.path")}>
            <MenuItem
              onSelected={() =>
                serverApi
                  .openFilePicker("/home/deck", true)
                  .then((e) => onFileChosen(e, "file"))
                  .catch()
              }
            >
              {translate("file")}
            </MenuItem>
            <MenuItem
              onSelected={() =>
                serverApi
                  .openFilePicker("/home/deck", false)
                  .then((e) => onFileChosen(e, "directory"))
                  .catch()
              }
            >
              {translate("folder")}
            </MenuItem>
            <MenuItem
              onSelected={() =>
                serverApi
                  .openFilePicker("/home/deck", false)
                  .then((e) => onFileChosen(e, "directory-norecurse"))
                  .catch()
              }
            >
              {translate("folder.exclude")}
            </MenuItem>
          </Menu>
        )
      }
      disabled={buttonDisabled}
    >
      {file === "includes" ? translate("add.to.sync") : translate("exclude.from.sync")}
    </ButtonItem>
  );
}
