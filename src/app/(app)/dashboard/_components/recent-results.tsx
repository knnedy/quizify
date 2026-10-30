import Link from "next/link";
import { PlayIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { getCategoryIcon } from "@/lib/category-icons";
import { cn } from "@/lib/utils";
import type { RecentResult } from "../mock-data";

function tone(percentage: number) {
  if (percentage >= 70) return "bg-correct-soft text-correct-ink";
  if (percentage >= 40) return "bg-xp-soft text-xp-ink";
  return "bg-incorrect-soft text-incorrect-ink";
}

function when(days: number) {
  if (days === 0) return "Today";
  return days === 1 ? "Yesterday" : `${days} days ago`;
}

export function RecentResults({ results }: { results: RecentResult[] }) {
  return (
    <section
      aria-labelledby="recent-heading"
      className="rounded-2xl border bg-card p-5 shadow-xs sm:p-6">
      <div className="space-y-1">
        <h2 id="recent-heading" className="text-xl">
          Recent results
        </h2>
        <p className="text-sm text-muted-foreground">
          Select one to open the quiz and play it again.
        </p>
      </div>

      {results.length === 0 ? (
        <div className="mt-5 flex flex-col items-center gap-4 rounded-xl border border-dashed px-6 py-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <PlayIcon aria-hidden className="size-5" />
          </span>
          <div className="space-y-1">
            <p className="font-medium">No results yet</p>
            <p className="text-sm text-muted-foreground">
              Finish a quiz and your score lands here.
            </p>
          </div>
          <Link
            href="/quizzes"
            className={buttonVariants({ variant: "outline" })}>
            Browse quizzes
          </Link>
        </div>
      ) : (
        <ul className="mt-3 divide-y">
          {results.map((result) => {
            const Icon = getCategoryIcon(result.category.slug);

            return (
              <li key={result.slug}>
                <Link
                  href={`/quizzes/${result.slug}`}
                  className="group -mx-2 flex items-center gap-3.5 rounded-xl px-2 py-3 transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-ring">
                  <span
                    aria-hidden
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                    <Icon className="size-5" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium group-hover:underline">
                      {result.title}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {result.category.name} · {when(result.daysAgo)}
                    </span>
                  </span>

                  <span className="hidden text-sm font-medium text-xp-ink tabular-nums sm:block">
                    +{result.xp} XP
                  </span>
                  <span className="text-sm font-medium tabular-nums">
                    {result.score}/{result.total}
                  </span>
                  <span
                    className={cn(
                      "w-12 rounded-full py-0.5 text-center text-xs font-semibold tabular-nums",
                      tone(result.percentage),
                    )}>
                    {result.percentage}%
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
