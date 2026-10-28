import Link from "next/link";
import { formatDate } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import type { PlayEntry } from "../mock-data";

function tone(percentage: number) {
  if (percentage >= 70) return "bg-correct-soft text-correct-ink";
  if (percentage >= 40) return "bg-xp-soft text-xp-ink";
  return "bg-incorrect-soft text-incorrect-ink";
}

export function UserActivity({
  weekly,
  recent,
}: {
  weekly: number[];
  recent: PlayEntry[];
}) {
  const total = weekly.reduce((sum, value) => sum + value, 0);
  const peak = Math.max(...weekly, 1);

  return (
    <section aria-labelledby="activity-heading" className="space-y-4">
      <h3 id="activity-heading" className="text-base">
        How they play
      </h3>

      <div className="space-y-3 rounded-xl border p-4">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-medium">Last 12 weeks</p>
          <p className="text-sm text-muted-foreground tabular-nums">
            {total} {total === 1 ? "quiz" : "quizzes"} played
          </p>
        </div>

        <div
          role="img"
          aria-label={`Quizzes played each week, oldest first: ${weekly.join(", ")}`}
          className="flex h-16 items-end gap-1.5">
          {weekly.map((value, index) => (
            <span
              key={index}
              aria-hidden
              title={`${value} ${value === 1 ? "quiz" : "quizzes"}`}
              className={cn(
                "flex-1 rounded-t-sm",
                index === weekly.length - 1 ? "bg-primary" : "bg-primary/35",
              )}
              style={{
                height: `${Math.max(value === 0 ? 4 : 10, (value / peak) * 100)}%`,
              }}
            />
          ))}
        </div>
      </div>

      {recent.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          They haven&rsquo;t finished a quiz yet.
        </p>
      ) : (
        <ul className="divide-y overflow-hidden rounded-xl border">
          {recent.map((entry) => {
            const percentage = Math.round((entry.score / entry.total) * 100);

            return (
              <li
                key={`${entry.slug}-${entry.at}`}
                className="flex items-center gap-3 px-4 py-3">
                <span className="min-w-0 flex-1">
                  <Link
                    href={`/quizzes/${entry.slug}`}
                    className="block truncate text-sm font-medium hover:underline">
                    {entry.quiz}
                  </Link>
                  <span className="block text-xs text-muted-foreground">
                    {formatDate(entry.at)}
                  </span>
                </span>
                <span className="text-sm text-muted-foreground tabular-nums">
                  {entry.score}/{entry.total}
                </span>
                <span
                  className={cn(
                    "w-12 rounded-full py-0.5 text-center text-xs font-semibold tabular-nums",
                    tone(percentage),
                  )}>
                  {percentage}%
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
