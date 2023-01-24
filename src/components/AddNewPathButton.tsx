import { ButtonItem, showContextMenu, Menu, MenuItem, FilePickerRes, showModal, ConfirmModal } from "decky-frontend-lib";
import { useState } from "react";
import { PageProps } from "../types";
import { toastError } from "../utils";

export default function AddNewPathButton({ serverApi, onPathAdded }: PageProps<{ onPathAdded?: () => void }>) {
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const onFileChosen = (res: FilePickerRes, mode: "file" | "directory") => {
    if (res.realpath === "/") {
      showModal(<ConfirmModal strTitle="Are you mad??" strDescription="For your own safety, ability to sync the whole file system is disabled." />);
      return;
    }

    setButtonDisabled(true);

    const path = mode === "directory" ? `${res.realpath}/**` : res.realpath;
    serverApi
      .callPluginMethod<{ path: string }, number>("test_syncpath", { path })
      .then((r) => {
        if (!r.success) {
          toastError(serverApi, r.result);
          setButtonDisabled(false);
          return;
        }

        showModal(
          <ConfirmModal
            strTitle="Confirm Add"
            strDescription={`Path '${path}' matches ${r.result} file(s). Proceed?`}
            onCancel={() => setButtonDisabled(false)}
            onEscKeypress={() => setButtonDisabled(false)}
            onOK={() => {
              serverApi
                .callPluginMethod<{ path: string }, void>("add_syncpath", { path })
                .then(() => {
                  if (onPathAdded) onPathAdded();
                })
                .catch((e) => toastError(serverApi, e))
                .finally(() => setButtonDisabled(false));
            }}
          />
        );
      })
      .catch((e) => {
        toastError(serverApi, e);
        setButtonDisabled(false);
      });
  };

  return (
    <ButtonItem
      // icon={<FaPlus />}
      layout="below"
      onClick={() =>
        showContextMenu(
          <Menu label="Select Path to Sync">
            <MenuItem
              onSelected={() =>
                serverApi
                  .openFilePicker("/home/deck", true)
                  .then((e) => onFileChosen(e, "file"))
                  .catch()
              }
            >
              File
            </MenuItem>
            <MenuItem
              onSelected={() =>
                serverApi
                  .openFilePicker("/home/deck", false)
                  .then((e) => onFileChosen(e, "directory"))
                  .catch()
              }
            >
              Folder
            </MenuItem>
          </Menu>
        )
      }
      disabled={buttonDisabled}
    >
      Add New Path to Sync
    </ButtonItem>
  );
}
