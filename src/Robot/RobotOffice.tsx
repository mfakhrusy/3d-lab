import { createSignal, Show } from "solid-js";
import { RobotBase } from "./RobotBase";
import { SpeechBubble } from "./SpeechBubble";
import { ChatPanel } from "./ChatPanel";
import "./RobotOffice.css";

export type RoomActions = {
  toggleLamp: () => void;
  setLampOn: (on: boolean) => void;
  isLampOn: () => boolean;
};

type RobotOfficeProps = {
  roomActions: RoomActions;
  isInteractive: boolean;
};

export function RobotOffice(props: RobotOfficeProps) {
  const [isChatMode, setIsChatMode] = createSignal(false);
  const [isTalking, setIsTalking] = createSignal(false);
  const [isWelcomeStarted, setIsWelcomeStarted] = createSignal(false);
  const [isWelcomeComplete, setIsWelcomeComplete] = createSignal(false);

  const handleRobotClick = (e: Event) => {
    e.stopPropagation();
    if (!props.isInteractive) return;
    setIsChatMode(true);
  };

  const handleBackdropClick = () => {
    setIsChatMode(false);
  };

  return (
    <>
      <Show when={isChatMode()}>
        <div class="robot-backdrop" onClick={handleBackdropClick} />
      </Show>

      <div
        class="robot-persona"
        classList={{ "robot-persona-chat-mode": isChatMode() }}
        onClick={handleRobotClick}
      >
        <RobotBase
          isTalking={isTalking()}
          showWave={isWelcomeStarted() && !isWelcomeComplete()}
          isInteractive={props.isInteractive}
          view="front"
        />
        <Show when={!isChatMode()}>
          <SpeechBubble
            onTalkingChange={setIsTalking}
            onStart={() => setIsWelcomeStarted(true)}
            onComplete={() => setIsWelcomeComplete(true)}
          />
        </Show>
        <Show when={isChatMode()}>
          <ChatPanel
            onTalkingChange={setIsTalking}
            roomActions={props.roomActions}
          />
        </Show>
      </div>
    </>
  );
}
