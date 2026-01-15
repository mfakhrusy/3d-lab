import { createSignal, onMount, Show } from "solid-js";
import { RobotBase, type RobotView } from "./RobotBase";
import { SpeechBubble } from "./SpeechBubble";
import { ChatPanel } from "./ChatPanel";
import { parseLabCommand } from "./commands/labCommands";
import type { LabActions } from "./types";
import "./RobotLab.css";

const labSentences = [
  "Welcome to the lab!",
  " Try saying 'paint it green' or 'make it red'!",
];

type RobotLabPhase =
  | "waiting"
  | "entering"
  | "arrived"
  | "talking"
  | "chatting";

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

    // Start talking
    setTimeout(() => {
      setPhase("talking");
    }, 4700);
  });

  const handleSpeechComplete = () => {
    setIsTalking(false);
    setPhase("chatting");
    props.onEntryComplete?.();
  };

  const handleRobotClick = (e: Event) => {
    e.stopPropagation();
    if (phase() === "arrived") {
      setPhase("chatting");
    }
  };

  return (
    <div
      class="robot-lab-container"
      classList={{
        "robot-lab-waiting": phase() === "waiting",
        "robot-lab-entering": phase() === "entering",
        "robot-lab-arrived":
          phase() === "arrived" ||
          phase() === "talking" ||
          phase() === "chatting",
      }}
      onClick={handleRobotClick}
    >
      <div class="robot-lab-body">
        <RobotBase
          view={robotView()}
          isTalking={isTalking()}
          isInteractive={true}
        />
      </div>

      {/* Speech bubble during intro */}
      <Show when={phase() === "talking"}>
        <div class="robot-lab-speech">
          <SpeechBubble
            sentences={labSentences}
            startDelay={0}
            onTalkingChange={setIsTalking}
            onComplete={handleSpeechComplete}
          />
        </div>
      </Show>

      {/* Chat panel after intro */}
      <Show when={phase() === "chatting"}>
        <div class="robot-lab-chat">
          <ChatPanel
            onTalkingChange={setIsTalking}
            actions={props.labActions}
            parseCommand={parseLabCommand}
            welcomeMessage="Try changing the lab colors! Say 'paint it green' or 'make it red'."
          />
        </div>
      </Show>
    </div>
  );
}
