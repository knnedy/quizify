import type { ComponentType } from "react";
import { ClockIcon, TrendingUpIcon, TrophyIcon } from "lucide-react";
import { formatSecondsToMinutes } from "@/lib/format-date";
import type { QuizResult } from "../mock-data";

function Tile({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-xs">
      <dt className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4" />
        {label}
      </dt>
      <dd className="mt-3 font-display text-3xl leading-none font-bold tabular-nums">
        {value}
      </dd>
      <dd className="mt-2 text-sm text-muted-foreground tabular-nums">
        {note}
      </dd>
    </div>
  );
}

function bestNote(result: QuizResult) {
  if (result.previousBest === null) return "First attempt";
  if (result.isNewBest) return `New best, up from ${result.previousBest}`;
  if (result.score === result.previousBest) return "Matches your best";
  return "Your best is higher";
}

export function ResultStats({ result }: { result: QuizResult }) {
  const best = Math.max(result.score, result.previousBest ?? 0);

  return (
    <dl className="grid gap-4 sm:grid-cols-3">
      <Tile
        icon={ClockIcon}
        label="Time taken"
        value={formatSecondsToMinutes(result.timeSeconds)}
        note={
          result.timeLimitSeconds
            ? result.status === "TIMED_OUT"
              ? "Time limit reached"
              : `of ${formatSecondsToMinutes(result.timeLimitSeconds)}`
            : "No time limit"
        }
      />
      <Tile
        icon={TrophyIcon}
        label="Leaderboard rank"
        value={`#${result.rank}`}
        note={`of ${result.players.toLocaleString("en-US")} players`}
      />
      <Tile
        icon={TrendingUpIcon}
        label="Personal best"
        value={`${best}/${result.total}`}
        note={bestNote(result)}
      />
    </dl>
  );
}
