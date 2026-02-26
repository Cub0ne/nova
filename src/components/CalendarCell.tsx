"use client";

import { useMemo, useRef } from "react";

interface CalendarCellProps {
  dateKey: string;
  dayLabel: string | number;
  weekLabel: string;
  hasEntry: boolean;
  isToday: boolean;
  inRange: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onView: () => void;
  onEdit: () => void;
}

export default function CalendarCell({
  dayLabel,
  weekLabel,
  hasEntry,
  isToday,
  inRange,
  isSelected,
  onSelect,
  onView,
  onEdit
}: CalendarCellProps) {
  const clickTimerRef = useRef<number | null>(null);

  const className = useMemo(
    () =>
      `calendar-cell ${hasEntry ? "has-entry" : ""} ${isToday ? "today" : ""} ${
        inRange ? "in-range" : ""
      } ${isSelected ? "selected" : ""}`,
    [hasEntry, isToday, inRange, isSelected]
  );

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    if (event.shiftKey) {
      onSelect();
      return;
    }
    if (clickTimerRef.current) {
      window.clearTimeout(clickTimerRef.current);
    }
    clickTimerRef.current = window.setTimeout(() => {
      onView();
      clickTimerRef.current = null;
    }, 220);
  }

  function handleDoubleClick() {
    if (clickTimerRef.current) {
      window.clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
    onEdit();
  }

  return (
    <button
      type="button"
      className={className}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <span className="day-number">{dayLabel}</span>
      <span className="day-week">{weekLabel}</span>
    </button>
  );
}
