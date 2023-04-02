import { ButtonItem, ConfirmModal, showModal } from "decky-frontend-lib";
import { useState } from "react";
import { FaFile, FaFolder, FaTrash } from "react-icons/fa";
import { getServerApi } from "../state";
import { PageProps } from "../types";
import { toastError } from "../utils";

export function RenderExistingPathButton({
  path,
  onPathRemoved,
  file,
}: PageProps<{ path: string; onPathRemoved?: () => void; file: "includes" | "excludes" }>) {
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const onClickDelete = () => {
    showModal(
      <ConfirmModal
        strTitle="Confirm Remove"
        strDescription={`Removing Path '${path}'. Proceed?`}
        onCancel={() => setButtonDisabled(false)}
        onEscKeypress={() => setButtonDisabled(false)}
        onOK={() => {
          setButtonDisabled(true);
          getServerApi().callPluginMethod<{ path: string; file: "includes" | "excludes" }, void>("remove_syncpath", { path, file }).then((res) => {
            if (res.success) {
              if (onPathRemoved) onPathRemoved();
            } else {
              toastError(res.result);
              setButtonDisabled(false);
            }
          });
        }}
      />
    );
  };

  return (
    <ButtonItem icon={path.endsWith("**") ? <FaFolder /> : <FaFile />} label={path} onClick={onClickDelete} disabled={buttonDisabled}>
      <FaTrash />
    </ButtonItem>
  );
}
