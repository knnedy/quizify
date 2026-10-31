import Link from "next/link";
import { ScoreRing } from "@/components/score-ring";
import { buttonVariants } from "@/components/ui/button";
import { XpChip } from "@/components/xp-chip";
import { formatDate, formatSecondsToMinutes } from "@/lib/format-date";
import type { BestResult } from "@/types/quiz";

export function BestResultPanel({
  best,
  slug,
}: {
  best: BestResult;
  slug: string;
}) {
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

      <Link
        href={`/quizzes/${slug}/results`}
        className={buttonVariants({
          variant: "outline",
          size: "sm",
          className: "w-full",
        })}>
        View last result
      </Link>
    </section>
  );
}
