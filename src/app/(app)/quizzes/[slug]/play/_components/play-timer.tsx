import { ClockIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "calm" | "warm" | "urgent";

const fillClasses: Record<Tone, string> = {
  calm: "bg-primary",
  warm: "bg-streak",
  urgent: "bg-incorrect",
};

const textClasses: Record<Tone, string> = {
  calm: "text-muted-foreground",
  warm: "text-streak-ink",
  urgent: "text-incorrect-ink",
};

function getTone(remaining: number, total: number): Tone {
  const ratio = remaining / total;
  if (ratio <= 0.1) return "urgent";
  if (ratio <= 0.25) return "warm";
  return "calm";
}

function formatClock(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

export function TimerLine({
  remaining,
  total,
}: {
  remaining: number;
  total: number;
}) {
  return (
    <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-muted">
      <div
        className={cn(
          "h-full transition-[width,background-color] duration-1000 ease-linear",
          fillClasses[getTone(remaining, total)],
        )}
        style={{ width: `${(remaining / total) * 100}%` }}
      />
    </div>
  );
}

export function TimerClock({
  remaining,
  total,
}: {
  remaining: number;
  total: number;
}) {
  return (
    <span
      role="timer"
      className={cn(
        "flex items-center gap-1.5 text-sm font-semibold tabular-nums",
        textClasses[getTone(remaining, total)],
      )}>
      <ClockIcon className="size-4" />
      {formatClock(remaining)}
    </span>
  );
}
