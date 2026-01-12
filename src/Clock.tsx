import { createSignal, onCleanup, onMount } from "solid-js";
import "./Clock.css";

export function Clock() {
  const [time, setTime] = createSignal(new Date());

  onMount(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    onCleanup(() => clearInterval(interval));
  });

  const hourRotation = () => {
    const hours = time().getHours() % 12;
    const minutes = time().getMinutes();
    return (hours * 30) + (minutes * 0.5);
  };

  const minuteRotation = () => {
    const minutes = time().getMinutes();
    const seconds = time().getSeconds();
    return (minutes * 6) + (seconds * 0.1);
  };

  return (
    <svg
      class="clock"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Clock face */}
      <circle
        cx="50"
        cy="50"
        r="48"
        class="clock-face"
      />
      
      {/* Inner ring */}
      <circle
        cx="50"
        cy="50"
        r="44"
        class="clock-inner"
      />

      {/* Hour markers */}
      {[...Array(12)].map((_, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const x1 = 50 + 38 * Math.cos(angle);
        const y1 = 50 + 38 * Math.sin(angle);
        const x2 = 50 + 42 * Math.cos(angle);
        const y2 = 50 + 42 * Math.sin(angle);
        return (
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            class="clock-marker"
          />
        );
      })}

      {/* Hour hand */}
      <line
        x1="50"
        y1="50"
        x2="50"
        y2="26"
        class="clock-hand hour-hand"
        style={{ transform: `rotate(${hourRotation()}deg)` }}
      />

      {/* Minute hand */}
      <line
        x1="50"
        y1="50"
        x2="50"
        y2="16"
        class="clock-hand minute-hand"
        style={{ transform: `rotate(${minuteRotation()}deg)` }}
      />

      {/* Center dot */}
      <circle
        cx="50"
        cy="50"
        r="3"
        class="clock-center"
      />
    </svg>
  );
}
