import { createSignal, createEffect, For, Show } from "solid-js";
import { labHelpCommands } from "../../Robot/commands/labCommands";
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
    <>
      <Show when={!isMinimized()}>
        <div class="lab-terminal help-terminal">
          {/* Header */}
          <div class="lab-terminal-header">
            <span class="lab-terminal-title">HELP</span>
            <button
              class="lab-terminal-minimize"
              onClick={handleMinimize}
              title="Minimize"
            >
              <span class="lab-terminal-minimize-icon" />
            </button>
          </div>

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
        </div>
      </Show>

      <Show when={isMinimized()}>
        <button
          class="lab-terminal-fab help-terminal-fab"
          onClick={handleExpand}
          title="Open Help"
        >
          <span class="lab-terminal-fab-icon">?</span>
        </button>
      </Show>
    </>
  );
}
