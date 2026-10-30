import { CheckIcon, FlameIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Streak } from "../mock-data";

function getMessage(streak: Streak) {
  if (streak.playedToday) return "You've played today. Your streak is safe.";
  if (streak.current > 0) return "Play today to keep your streak alive.";
  return "Play a quiz today to start a streak.";
}

export function StreakCard({ streak }: { streak: Streak }) {
  const active = streak.current > 0;

  return (
    <section
      aria-label="Streak"
      className="flex flex-col gap-6 rounded-2xl border bg-card p-6 shadow-xs">
      <div className="flex items-center gap-4">
        <span
          className={cn(
            "flex size-14 shrink-0 items-center justify-center rounded-2xl",
            active
              ? "bg-streak-soft text-streak-ink"
              : "bg-muted text-muted-foreground",
          )}>
          <FlameIcon
            aria-hidden
            className={cn("size-7", active && "fill-current")}
          />
        </span>

        <div>
          <p className="font-display text-4xl leading-none font-bold tabular-nums">
            {streak.current}
            <span className="ml-2 text-base font-medium text-muted-foreground">
              {streak.current === 1 ? "day" : "days"}
            </span>
          </p>
          <p className="mt-1.5 text-sm text-muted-foreground">Current streak</p>
        </div>
      </div>

      <ol aria-label="Last 7 days" className="grid grid-cols-7 gap-1.5">
        {streak.days.map((day, index) => (
          <li key={index} className="flex flex-col items-center gap-2">
            <span
              className={cn(
                "flex size-9 items-center justify-center rounded-full",
                day.played
                  ? "bg-streak text-white"
                  : "bg-muted text-muted-foreground",
                day.today &&
                  "ring-2 ring-primary ring-offset-2 ring-offset-card",
              )}>
              {day.played && (
                <CheckIcon aria-hidden className="size-4 stroke-3" />
              )}
              <span className="sr-only">
                {day.label}: {day.played ? "played" : "not played"}
                {day.today ? ", today" : ""}
              </span>
            </span>
            <span
              aria-hidden
              className={cn(
                "text-xs",
                day.today
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground",
              )}>
              {day.label}
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-auto flex items-center justify-between gap-3 border-t pt-4 text-sm">
        <p className="text-muted-foreground">{getMessage(streak)}</p>
        <p className="shrink-0 font-medium tabular-nums">Best {streak.best}</p>
      </div>
    </section>
  );
}
