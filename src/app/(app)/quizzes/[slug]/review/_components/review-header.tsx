import Link from "next/link";
import {
  ArrowLeftIcon,
  CheckIcon,
  ClockIcon,
  MinusIcon,
  XIcon,
} from "lucide-react";
import { ScoreRing } from "@/components/score-ring";
import type { QuizReview, ReviewCounts } from "../mock-data";

export function ReviewHeader({
  review,
  counts,
}: {
  review: QuizReview;
  counts: ReviewCounts;
}) {
  const pills = [
    {
      key: "correct",
      label: "correct",
      Icon: CheckIcon,
      tone: "bg-correct-soft text-correct-ink",
      count: counts.correct,
    },
    {
      key: "incorrect",
      label: "incorrect",
      Icon: XIcon,
      tone: "bg-incorrect-soft text-incorrect-ink",
      count: counts.incorrect,
    },
    {
      key: "skipped",
      label: "not answered",
      Icon: MinusIcon,
      tone: "bg-muted text-muted-foreground",
      count: counts.skipped,
    },
  ].filter((pill) => pill.count > 0);

  return (
    <section className="relative overflow-hidden border-b">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_70%_at_90%_0%,var(--glow),transparent)]"
      />
      <div className="relative mx-auto max-w-3xl space-y-8 px-6 py-10 sm:py-12">
        <Link
          href={`/quizzes/${review.slug}/results`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeftIcon className="size-4" />
          Back to results
        </Link>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 space-y-3">
            <h1 className="text-4xl sm:text-5xl">Review answers</h1>
            <p className="text-lg text-muted-foreground">{review.title}</p>
          </div>

          <div className="flex shrink-0 items-center gap-4">
            <ScoreRing percentage={review.percentage} />
            <div>
              <p className="font-display text-2xl leading-none font-bold tabular-nums">
                {review.score} of {review.total}
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">correct</p>
            </div>
          </div>
        </div>

        <ul className="flex flex-wrap gap-2">
          {pills.map(({ key, label, Icon, tone, count }) => (
            <li
              key={key}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold tabular-nums ${tone}`}>
              <Icon aria-hidden className="size-4" />
              {count} {label}
            </li>
          ))}
        </ul>

        {review.status === "TIMED_OUT" && (
          <div className="flex gap-3 rounded-xl border border-streak/30 bg-streak-soft px-4 py-3 text-sm text-streak-ink">
            <ClockIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
            <p>
              Time ran out after {review.answered} of {review.total} questions.
              The rest counted as incorrect.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
