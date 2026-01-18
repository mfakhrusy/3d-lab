import { createSignal, createEffect, For } from "solid-js";
import { labHelpCommands } from "../../Robot/commands/labCommands";
import { DraggableTerminal } from "./DraggableTerminal";
import "./LabTerminal.css";

type HelpTerminalProps = {
  expanded?: boolean;
  onMinimize?: () => void;
  onExpand?: () => void;
};

export function HelpTerminal(props: HelpTerminalProps) {
  const [isMinimized, setIsMinimized] = createSignal(true);

  createEffect(() => {
    if (props.expanded) {
      setIsMinimized(false);
    }
  });

  const handleMinimize = () => {
    setIsMinimized(true);
    props.onMinimize?.();
  };

  const handleExpand = () => {
    setIsMinimized(false);
    props.onExpand?.();
  };

  return (
    <DraggableTerminal
      title="HELP"
      initialPosition={{ x: window.innerWidth - 430, y: 30 }}
      initialSize={{ width: 400, height: 350 }}
      minSize={{ width: 250, height: 150 }}
      isMinimized={() => isMinimized()}
      onMinimize={handleMinimize}
      onExpand={handleExpand}
      fabIcon="?"
      fabClass="help-terminal-fab"
      terminalClass="help-terminal"
    >
      {/* Help content */}
      <div class="lab-terminal-output">
        <div class="lab-terminal-line lab-terminal-line-system">
          <span class="lab-terminal-text">Available Commands:</span>
        </div>
        <For each={labHelpCommands}>
          {(item) => (
            <div class="help-command-item">
              <span class="help-command-name">{item.command}</span>
              <span class="help-command-desc">{item.description}</span>
            </div>
          )}
        </For>
      </div>
    </DraggableTerminal>
  );
}
