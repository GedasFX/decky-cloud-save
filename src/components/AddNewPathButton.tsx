import { ButtonItem, showContextMenu, Menu, MenuItem, FilePickerRes } from "decky-frontend-lib";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { PageProps } from "../types";

export default function AddNewPathButton({ serverApi, onPathAdded }: PageProps<{ onPathAdded?: () => void }>) {
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const onFileChosen = async (res: FilePickerRes, mode: "file" | "directory") => {
    setButtonDisabled(true);
    try {
      await serverApi.callPluginMethod<{ path: string }, string>("add_syncpath", { path: mode === "directory" ? `${res.realpath}/**` : res.realpath });
      if (onPathAdded) onPathAdded();
    } finally {
      setButtonDisabled(false);
    }
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
