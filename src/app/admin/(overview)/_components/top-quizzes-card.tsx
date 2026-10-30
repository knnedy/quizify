import Link from "next/link";
import { StarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TopQuiz } from "../mock-data";

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function TopQuizzesCard({ quizzes }: { quizzes: TopQuiz[] }) {
  return (
    <section
      aria-labelledby="top-quizzes-heading"
      className="rounded-2xl border bg-card p-5 shadow-xs sm:p-6">
      <div className="space-y-1">
        <h2 id="top-quizzes-heading" className="text-xl">
          Most played quizzes
        </h2>
        <p className="text-sm text-muted-foreground">All time.</p>
      </div>

      <ol className="mt-4 divide-y">
        {quizzes.map((quiz, index) => (
          <li key={quiz.slug}>
            <Link
              href={`/quizzes/${quiz.slug}`}
              className="group -mx-2 flex items-center gap-3.5 rounded-xl px-2 py-3 transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-ring">
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg font-display text-sm font-bold tabular-nums",
                  index === 0
                    ? "bg-xp-soft text-xp-ink"
                    : "bg-muted text-muted-foreground",
                )}>
                {index + 1}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium group-hover:underline">
                  {quiz.title}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {quiz.categoryName}
                </span>
              </span>

              <span className="text-right tabular-nums">
                <span className="block text-sm font-medium">
                  {compact.format(quiz.plays)} plays
                </span>
                <span className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                  {quiz.avgRating !== null ? (
                    <>
                      <StarIcon
                        aria-hidden
                        className="size-3 fill-xp text-xp"
                      />
                      {quiz.avgRating.toFixed(1)}
                    </>
                  ) : (
                    "New"
                  )}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
