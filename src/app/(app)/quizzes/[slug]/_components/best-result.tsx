import { XpChip } from "@/components/xp-chip";
import { formatDate } from "@/lib/format-date";
import { formatSecondsToMinutes } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import type { BestResult } from "../mock-data";

function ScoreRing({ percentage }: { percentage: number }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const tone =
    percentage >= 70
      ? "text-correct"
      : percentage >= 40
        ? "text-xp"
        : "text-incorrect";

  return (
    <div className="relative size-20 shrink-0">
      <svg viewBox="0 0 80 80" className="size-full -rotate-90" aria-hidden>
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          strokeWidth="7"
          className="stroke-muted"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${(circumference * percentage) / 100} ${circumference}`}
          className={cn("stroke-current", tone)}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-display text-lg font-bold tabular-nums">
        {percentage}%
      </span>
    </div>
  );
}

export function BestResultPanel({ best }: { best: BestResult }) {
  return (
    <section
      aria-labelledby="best-result-heading"
      className="space-y-4 rounded-2xl border bg-card p-5 shadow-xs">
      <h2 id="best-result-heading" className="text-lg">
        Your best result
      </h2>

      <div className="flex items-center gap-4">
        <ScoreRing percentage={best.percentage} />
        <div className="min-w-0 space-y-1">
          <p className="font-display text-xl font-bold tabular-nums">
            {best.score} of {best.total} correct
          </p>
          <p className="text-sm text-muted-foreground tabular-nums">
            {formatSecondsToMinutes(best.timeSeconds)} · Rank #{best.rank}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4 text-sm text-muted-foreground">
        <span>
          {best.attempts} {best.attempts === 1 ? "attempt" : "attempts"} · last
          played {formatDate(best.lastPlayedAt)}
        </span>
        <XpChip>+{best.xpEarned} XP</XpChip>
      </div>
    </section>
  );
}
