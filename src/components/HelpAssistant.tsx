import { ConfirmModal, Menu, MenuItem, Navigation, showContextMenu, showModal } from "decky-frontend-lib";

export function HelpAssistant({ entries }: { entries: { label: string; description: string; issueId?: string }[] }) {
  const openModal = (title: string, description: string, issueId?: string) => {
    showModal(
      <ConfirmModal
        strTitle={title}
        strDescription={<span style={{ whiteSpace: "pre-wrap" }}>{description}</span>}
        bOKDisabled={!issueId}
        strOKButtonText="Go to Issue"
        strCancelButtonText="Close"
        onOK={() => Navigation.NavigateToExternalWeb(`https://github.com/GedasFX/decky-cloud-save/issues/${issueId}`)}
      />
    );
  };

  const onClick = () => {
    showContextMenu(
      <Menu label="Help">
        {entries.map((e) => (
          <MenuItem onSelected={() => openModal(e.label, e.description, e.issueId)}>{e.label}</MenuItem>
        ))}
      </Menu>
    );
  };

  return (
    <span style={{ textDecoration: "underline", fontSize: "small", marginTop: "auto" }} onClick={onClick}>
      Help?
    </span>
  );
}
