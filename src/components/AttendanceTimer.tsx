import { Clock3 } from "lucide-react";
import { useEffect, useState } from "react";

interface AttendanceTimerProps {
  startedAt?: string | null;
  active: boolean;
  compact?: boolean;
}

const formatElapsedTime = (startedAt: string | null | undefined, now: number) => {
  const start = startedAt ? new Date(startedAt).getTime() : Number.NaN;
  const elapsedSeconds = Number.isFinite(start) ? Math.max(0, Math.floor((now - start) / 1000)) : 0;
  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
};

const AttendanceTimer = ({ startedAt, active, compact = false }: AttendanceTimerProps) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    setNow(Date.now());
    if (!active || !startedAt) return;
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [active, startedAt]);

  if (!active || !startedAt) return null;

  return (
    <div className={`flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 ${compact ? "px-3 py-2" : "p-4"}`}>
      <div className="rounded-full bg-primary p-2 text-white">
        <Clock3 className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Time clocked in</p>
        <p className={`${compact ? "text-xl" : "text-3xl"} font-bold tabular-nums text-primary`} aria-label="Elapsed work time">
          {formatElapsedTime(startedAt, now)}
        </p>
      </div>
    </div>
  );
};

export default AttendanceTimer;
