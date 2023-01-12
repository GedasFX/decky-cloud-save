import { ButtonItem, ConfirmModal, showModal } from "decky-frontend-lib";
import { useState } from "react";
import { FaFile, FaFolder, FaTrash } from "react-icons/fa";
import { PageProps } from "../types";
import { toastError } from "../utils";

export function RenderExistingPathButton({ path, serverApi, onPathRemoved }: PageProps<{ path: string; onPathRemoved?: () => void }>) {
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
          serverApi.callPluginMethod<{ path: string }, void>("remove_syncpath", { path }).then((res) => {
            if (res.success) {
              if (onPathRemoved) onPathRemoved();
            } else {
              toastError(serverApi, res.result);
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
