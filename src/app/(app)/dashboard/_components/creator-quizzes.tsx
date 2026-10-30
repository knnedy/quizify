import Link from "next/link";
import { PencilIcon, StarIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { getCategoryIcon } from "@/lib/category-icons";
import type { CreatorQuiz } from "../mock-data";

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function CreatorQuizzes({ quizzes }: { quizzes: CreatorQuiz[] }) {
  return (
    <section
      aria-labelledby="creator-quizzes-heading"
      className="rounded-2xl border bg-card p-5 shadow-xs sm:p-6">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <h2 id="creator-quizzes-heading" className="text-xl">
            Your quizzes
          </h2>
          <p className="text-sm text-muted-foreground">
            Most played first. The finish rate is how many players who start go
            on to complete it.
          </p>
        </div>
        <Link
          href="/my-quizzes"
          className="shrink-0 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
          Manage all
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <p className="mt-5 rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          Publish a quiz and its numbers show up here.
        </p>
      ) : (
        <ul className="mt-3 divide-y">
          {quizzes.map((quiz) => {
            const Icon = getCategoryIcon(quiz.category.slug);

            return (
              <li
                key={quiz.slug}
                className="flex flex-wrap items-center gap-x-4 gap-y-3 py-4">
                <span
                  aria-hidden
                  className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted">
                  <Icon className="size-5" />
                </span>

                <div className="min-w-0 flex-1 basis-48 space-y-1">
                  <Link
                    href={`/quizzes/${quiz.slug}`}
                    className="block truncate font-medium hover:underline">
                    {quiz.title}
                  </Link>
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground tabular-nums">
                    <span>{compact.format(quiz.plays)} plays</span>
                    <span>{quiz.plays30} in 30 days</span>
                    <span className="inline-flex items-center gap-1">
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
                  </p>
                </div>

                <div className="w-32 space-y-1.5">
                  <p className="flex justify-between text-xs text-muted-foreground tabular-nums">
                    Finish rate
                    <span className="font-medium text-foreground">
                      {quiz.finishRate}%
                    </span>
                  </p>
                  <div
                    aria-hidden
                    className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${quiz.finishRate}%` }}
                    />
                  </div>
                </div>

                <Link
                  href={`/my-quizzes/${quiz.slug}/edit`}
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                  })}>
                  <PencilIcon />
                  Edit
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
