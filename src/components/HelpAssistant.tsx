import { ConfirmModal, showModal } from "decky-frontend-lib";

export function HelpAssistant({ strDescription }: { strDescription: string }) {
  const onClick = () => {
    showModal(
      <div style={{ whiteSpace: "pre-wrap" }}>
        <ConfirmModal strTitle="Help" strDescription={strDescription} />
      </div>
    );
  };

  return (
    <span style={{ textDecoration: "underline", fontSize: "small", marginTop: "auto" }} onClick={onClick}>
      Help?
    </span>
  );
}
