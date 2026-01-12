import { createSignal, Show } from "solid-js";
import "./Calendar.css";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function Calendar() {
  const [isZoomed, setIsZoomed] = createSignal(false);
  const today = new Date();
  
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const dayOfWeek = DAYS[today.getDay()];
  const monthName = MONTHS[currentMonth];
  const shortMonth = monthName.slice(0, 3).toUpperCase();

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const calendarDays = () => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const handleClick = (e: Event) => {
    e.stopPropagation();
    setIsZoomed(!isZoomed());
  };

  const handleBackdropClick = () => {
    setIsZoomed(false);
  };

  return (
    <>
      <Show when={isZoomed()}>
        <div class="calendar-backdrop" onClick={handleBackdropClick} />
      </Show>

      <div
        class="calendar"
        classList={{ "calendar-zoomed": isZoomed() }}
        onClick={handleClick}
      >
        {/* Compact view */}
        <Show when={!isZoomed()}>
          <div class="calendar-compact">
            <div class="calendar-month">{shortMonth}</div>
            <div class="calendar-day">{currentDay}</div>
            <div class="calendar-weekday">{dayOfWeek}</div>
          </div>
        </Show>

        {/* Expanded view */}
        <Show when={isZoomed()}>
          <div class="calendar-expanded">
            <div class="calendar-header">
              <span class="calendar-month-full">{monthName} {currentYear}</span>
            </div>
            
            <div class="calendar-weekdays">
              {DAYS.map((day) => (
                <div class="calendar-weekday-label">{day}</div>
              ))}
            </div>
            
            <div class="calendar-grid">
              {calendarDays().map((day) => (
                <div
                  class="calendar-date"
                  classList={{
                    "calendar-date-empty": day === null,
                    "calendar-date-today": day === currentDay,
                  }}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>
        </Show>
      </div>
    </>
  );
}
