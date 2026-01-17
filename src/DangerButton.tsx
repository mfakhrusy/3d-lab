import { createSignal } from "solid-js";
import "./DangerButton.css";

type DangerButtonProps = {
  isInteractive: boolean;
  onClick?: () => void;
  onHover?: () => void;
};

export function DangerButton(props: DangerButtonProps) {
  const [isPressed, setIsPressed] = createSignal(false);

  const handleClick = () => {
    if (!props.isInteractive) return;

    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 200);

    props.onClick?.();
  };

  const handleMouseEnter = () => {
    if (!props.isInteractive) return;
    props.onHover?.();
  };

  return (
    <div
      class="danger-button-container"
      classList={{ interactive: props.isInteractive }}
    >
      {/* Warning sign */}
      <div class="danger-warning">
        <span class="danger-text">DO NOT CLICK</span>
        <span class="danger-arrow">↓</span>
      </div>

      {/* The desk/cube */}
      <div class="danger-desk">
        {/* The red button */}
        <button
          class="danger-button"
          classList={{ pressed: isPressed() }}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          disabled={!props.isInteractive}
          aria-label="Danger button - Do not click"
        >
          <div class="button-top" />
          <div class="button-base" />
        </button>
      </div>
    </div>
  );
}
