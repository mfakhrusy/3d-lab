import { Show } from "solid-js";
import { CanvasControls } from "./CanvasControls";
import { GuestBook } from "./GuestBook";
import { HelpTerminal } from "./HelpTerminal";
import { useLab } from "./LabContext";
import { LabTerminal } from "./LabTerminal";
import { ShaderControls } from "./ShaderControls";
import { useMobile } from "./useMobile";
import type { LabActions } from "../../Robot/types";

type Props = {
  labActions: LabActions;
  onBack?: () => void;
};

export function LabTerminals(props: Props) {
  const { canvasVisible, shaderMode } = useLab();
  const isMobile = useMobile();

  return (
    <>
      <Show when={!isMobile()}>
        <LabTerminal labActions={props.labActions} handleBack={props.onBack} />
        <HelpTerminal />
      </Show>
      <GuestBook />
      <Show when={canvasVisible()}>
        <CanvasControls />
      </Show>
      <Show when={shaderMode() !== "none"}>
        <ShaderControls />
      </Show>
    </>
  );
}
