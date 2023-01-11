import { ButtonItem, PanelSectionRow } from "decky-frontend-lib";
import { VFC } from "react";
import { FaShip } from "react-icons/fa";

// TODO
export const ButtonPlayground: VFC = () => {
  return (
    <>
      <PanelSectionRow>
        <ButtonItem layout="below" onClick={() => {}}>
          ButtonItem
        </ButtonItem>
      </PanelSectionRow>
      <PanelSectionRow>
        <ButtonItem icon={<FaShip style={{ display: "block" }} />} label="Label" onClick={() => {}}>
          Icon and Label
        </ButtonItem>
      </PanelSectionRow>
      <PanelSectionRow>
        <ButtonItem layout="below" description="Description" onClick={() => {}}>
          Description
        </ButtonItem>
      </PanelSectionRow>
      <PanelSectionRow>
        <ButtonItem layout="below" disabled>
          Disabled
        </ButtonItem>
      </PanelSectionRow>
      <PanelSectionRow>
        <ButtonItem label="Label">With Label</ButtonItem>
      </PanelSectionRow>
      <PanelSectionRow>
        <ButtonItem label="Label" layout="below">
          With Label above
        </ButtonItem>
      </PanelSectionRow>
    </>
  );
};
