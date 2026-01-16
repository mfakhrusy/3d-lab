import { createSignal, onMount } from "solid-js";
import { RobotBase, type RobotView } from "./RobotBase";
import type { LabActions } from "./types";
import "./RobotLab.css";

type RobotLabPhase = "waiting" | "entering" | "arrived" | "terminal";

type RobotLabProps = {
  labActions: LabActions;
  onEntryComplete?: () => void;
};

export function RobotLab(props: RobotLabProps) {
  const [phase, setPhase] = createSignal<RobotLabPhase>("waiting");
  const [isTalking, setIsTalking] = createSignal(false);

  const robotView = (): RobotView => {
    const p = phase();
    if (p === "waiting" || p === "entering") return "back";
    return "front";
  };

  onMount(() => {
    // Start entrance after room animation completes (2s)
    setTimeout(() => {
      setPhase("entering");
    }, 2200);

    // Arrived at back of room - show face
    setTimeout(() => {
      setPhase("arrived");
    }, 4200);

    // Show terminal
    setTimeout(() => {
      setPhase("terminal");
      props.onEntryComplete?.();
    }, 4700);
  });

  return (
    <div
      class="robot-lab-container"
      classList={{
        "robot-lab-waiting": phase() === "waiting",
        "robot-lab-entering": phase() === "entering",
        "robot-lab-arrived": phase() === "arrived" || phase() === "terminal",
      }}
    >
      <div class="robot-lab-body">
        <RobotBase
          view={robotView()}
          isTalking={isTalking()}
          isInteractive={true}
        />
      </div>
    </div>
  );
}
