import { createSignal } from "solid-js";
import { ColorPicker } from "./ColorPicker";
import { useLab } from "./LabContext";
import "./MobileCanvasControls.css";

export function MobileCanvasControls() {
  const { brushColor, setBrushColor } = useLab();
  const [displayColor, setDisplayColor] = createSignal(brushColor());
  const [isMinimized, setIsMinimized] = createSignal(false);

  const handleColorChange = (color: string) => {
    setDisplayColor(color);
    setBrushColor(color);
  };

  return (
    <div
      class="mobile-canvas-controls"
      classList={{ "mobile-canvas-controls-minimized": isMinimized() }}
    >
      <div class="mobile-canvas-controls-header">
        <span class="mobile-canvas-controls-title">BRUSH</span>
        <button
          class="mobile-canvas-controls-toggle"
          onClick={() => setIsMinimized(!isMinimized())}
          title={isMinimized() ? "Maximize" : "Minimize"}
        >
          <span class="mobile-canvas-controls-toggle-icon">
            {isMinimized() ? "□" : "−"}
          </span>
        </button>
      </div>

      {!isMinimized() && (
        <div class="mobile-canvas-controls-body">
          <ColorPicker
            currentColor={displayColor()}
            onColorChange={handleColorChange}
          />
        </div>
      )}
    </div>
  );
}
