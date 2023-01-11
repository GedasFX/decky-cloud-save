import { ButtonItem, showContextMenu, Menu, MenuItem, FilePickerRes, showModal, ConfirmModal } from "decky-frontend-lib";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";
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
      .then((matches) => {
        console.log(matches);
        showModal(
          <ConfirmModal
            strDescription={`Path '${path}' matches ${matches.result} file(s). Proceed?`}
            strTitle="Confirm Adding?"
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
      icon={<FaPlus />}
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
