import { EllipsisIcon } from "lucide-react";
import { formatSecondsToMinutes } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry } from "@/types/quiz";

function Row({ entry, total }: { entry: LeaderboardEntry; total: number }) {
  return (
    <li
      className={cn(
        "flex items-center gap-4 px-5 py-3.5",
        entry.isYou && "bg-primary-soft",
      )}>
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg font-display text-sm font-bold tabular-nums",
          entry.isYou
            ? "bg-primary text-primary-foreground"
            : entry.rank === 1
              ? "bg-xp-soft text-xp-ink"
              : "bg-muted text-muted-foreground",
        )}>
        {entry.rank}
      </span>
      <span
        className={cn(
          "min-w-0 flex-1 truncate font-medium",
          entry.isYou && "text-primary",
        )}>
        {entry.isYou ? "You" : entry.name}
      </span>
      <span className="flex flex-col items-end tabular-nums">
        <span className="font-display font-bold">
          {entry.score}/{total}
        </span>
        <span className="text-xs text-muted-foreground">
          {formatSecondsToMinutes(entry.timeSeconds)}
        </span>
      </span>
    </li>
  );
}

export function Leaderboard({
  entries,
  pinned,
  total,
}: {
  entries: LeaderboardEntry[];
  pinned: LeaderboardEntry | null;
  total: number;
}) {
  return (
    <section aria-labelledby="leaderboard-heading" className="space-y-4">
      <div className="space-y-1">
        <h2 id="leaderboard-heading" className="text-2xl">
          Leaderboard
        </h2>
        <p className="text-sm text-muted-foreground">
          Best attempt per player. Ties go to the faster time.
        </p>
      </div>

      <ol className="divide-y overflow-hidden rounded-2xl border bg-card shadow-xs">
        {entries.map((entry) => (
          <Row key={entry.rank} entry={entry} total={total} />
        ))}
        {pinned && (
          <>
            <li
              aria-hidden
              className="flex justify-center py-1 text-muted-foreground">
              <EllipsisIcon className="size-4" />
            </li>
            <Row entry={pinned} total={total} />
          </>
        )}
      </ol>
    </section>
  );
}
