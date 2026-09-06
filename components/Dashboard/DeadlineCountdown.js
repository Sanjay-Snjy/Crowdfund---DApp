import { useState, useEffect, useMemo } from "react";
import { FiClock } from "react-icons/fi";

function pad(n) {
  return String(n).padStart(2, "0");
}

function useCountdown(deadlineTimestamp) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const diff = Math.max(0, deadlineTimestamp - now);

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, expired: false };
}

function CountdownBlock({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <span
        className="tabular-nums text-sm font-bold leading-none"
        style={{ color: "var(--color-text)" }}
      >
        {pad(value)}
      </span>
      <span className="text-[10px] uppercase tracking-wider mt-1" style={{ color: "var(--color-text-muted)" }}>
        {label}
      </span>
    </div>
  );
}

export default function DeadlineCountdown({ deadline }) {
  const deadlineTs = (Number(deadline?.toString?.() || 0)) * 1000;
  const { days, hours, minutes, seconds, expired } = useCountdown(deadlineTs);

  if (expired) {
    return (
      <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--color-text-muted)" }}>
        <FiClock className="w-3 h-3" />
        <span>Ended</span>
      </div>
    );
  }

  const isUrgent = days <= 2;

  return (
    <div className="flex items-center gap-1.5">
      <FiClock
        className="w-3 h-3 shrink-0"
        style={{ color: isUrgent ? "#f59e0b" : "var(--color-text-muted)" }}
      />
      <div className="flex items-center gap-1">
        {days > 0 && <CountdownBlock value={days} label="d" />}
        <CountdownBlock value={hours} label="h" />
        <span className="text-xs font-bold" style={{ color: "var(--color-text-muted)" }}>:</span>
        <CountdownBlock value={minutes} label="m" />
        <span className="text-xs font-bold" style={{ color: "var(--color-text-muted)" }}>:</span>
        <CountdownBlock value={seconds} label="s" />
      </div>
    </div>
  );
}
