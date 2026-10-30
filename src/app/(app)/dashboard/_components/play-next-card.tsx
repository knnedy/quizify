import Link from "next/link";
import { ClockIcon, PlayIcon } from "lucide-react";
import { DifficultyMeter } from "@/components/difficulty-meter";
import type { QuizCardData } from "@/components/quiz-card";
import { buttonVariants } from "@/components/ui/button";
import { getCategoryIcon } from "@/lib/category-icons";
import { formatSecondsToMinutes } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import type { InProgress } from "../mock-data";

export function PlayNextCard({
  inProgress,
  suggestion,
  isNew,
}: {
  inProgress: InProgress | null;
  suggestion: QuizCardData | null;
  isNew: boolean;
}) {
  if (inProgress) {
    const { answered, total, secondsLeft } = inProgress;

    return (
      <section
        aria-labelledby="next-heading"
        className="flex flex-col justify-between gap-6 rounded-2xl border border-primary/30 bg-primary-soft p-6 shadow-sm sm:p-7">
        <div className="space-y-5">
          <h2 id="next-heading" className="text-2xl">
            Pick up where you left off
          </h2>

          <div className="space-y-1">
            <p className="font-display text-xl font-semibold">
              {inProgress.title}
            </p>
            <p className="text-sm text-muted-foreground tabular-nums">
              {answered} of {total} questions answered
            </p>
          </div>

          <div
            role="progressbar"
            aria-label="Questions answered"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={answered}
            className="flex gap-1">
            {Array.from({ length: total }, (_, index) => (
              <span
                key={index}
                className={cn(
                  "h-2 flex-1 rounded-full",
                  index < answered ? "bg-primary" : "bg-primary/20",
                )}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground tabular-nums">
            <ClockIcon aria-hidden className="size-4" />
            {secondsLeft === null
              ? "No time limit"
              : `${formatSecondsToMinutes(secondsLeft)} left`}
          </span>
          <Link
            href={`/quizzes/${inProgress.slug}/play`}
            className={buttonVariants({
              size: "lg",
              className: "shadow-primary",
            })}>
            <PlayIcon className="fill-current" />
            Resume quiz
          </Link>
        </div>
      </section>
    );
  }

  if (!suggestion) return null;

  const Icon = getCategoryIcon(suggestion.category.slug);

  return (
    <section
      aria-labelledby="next-heading"
      className="relative isolate flex flex-col justify-between gap-6 overflow-hidden rounded-2xl border bg-card p-6 shadow-sm sm:p-7">
      <Icon
        aria-hidden
        strokeWidth={1.25}
        className="pointer-events-none absolute -top-6 -right-6 -z-10 size-44 rotate-12 text-foreground/4"
      />

      <div className="space-y-5">
        <h2 id="next-heading" className="text-2xl">
          {isNew ? "Start with a quiz" : "Ready for your next quiz?"}
        </h2>

        <div className="space-y-2">
          <p className="font-display text-xl font-semibold">
            {suggestion.title}
          </p>
          <p className="line-clamp-2 max-w-prose text-muted-foreground">
            {suggestion.description}
          </p>
        </div>

        <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground tabular-nums">
          <li>{suggestion.category.name}</li>
          <li>{suggestion.questions} questions</li>
          <li>
            <DifficultyMeter difficulty={suggestion.difficulty} />
          </li>
        </ul>
      </div>

      <div>
        <Link
          href={`/quizzes/${suggestion.slug}`}
          className={buttonVariants({
            size: "lg",
            className: "shadow-primary",
          })}>
          <PlayIcon className="fill-current" />
          See the quiz
        </Link>
      </div>
    </section>
  );
}
