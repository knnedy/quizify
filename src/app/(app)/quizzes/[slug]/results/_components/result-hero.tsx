import Link from "next/link";
import {
  ArrowLeftIcon,
  ClockIcon,
  ListChecksIcon,
  RotateCcwIcon,
  SparklesIcon,
  TrophyIcon,
} from "lucide-react";
import { ScoreRing } from "@/components/score-ring";
import { buttonVariants } from "@/components/ui/button";
import { XpChip } from "@/components/xp-chip";
import type { QuizResult } from "../mock-data";

function getVerdict({ status, percentage, answered, total }: QuizResult) {
  if (status === "TIMED_OUT") {
    return {
      title: "Time ran out",
      text: `You answered ${answered} of ${total}. Unanswered questions counted as incorrect.`,
    };
  }
  if (percentage === 100) {
    return {
      title: "Flawless",
      text: "Every answer right. Hard to do better than that.",
    };
  }
  if (percentage >= 80) {
    return { title: "Great run", text: "Only a few slipped past you." };
  }
  if (percentage >= 60) {
    return {
      title: "Nicely done",
      text: "A solid score, with room to climb.",
    };
  }
  if (percentage >= 40) {
    return {
      title: "Not bad",
      text: "The review will show you where the points got away.",
    };
  }
  return {
    title: "Keep at it",
    text: "Every attempt teaches you something. Check the review, then go again.",
  };
}

function getBadge(result: QuizResult) {
  if (result.status === "TIMED_OUT") {
    return {
      label: "Timed out",
      Icon: ClockIcon,
      className: "bg-streak-soft text-streak-ink",
    };
  }
  if (result.percentage === 100) {
    return {
      label: "Perfect score",
      Icon: SparklesIcon,
      className: "bg-correct-soft text-correct-ink",
    };
  }
  if (result.isNewBest) {
    return {
      label: "New personal best",
      Icon: TrophyIcon,
      className: "bg-xp-soft text-xp-ink",
    };
  }
  return null;
}

export function ResultHero({ result }: { result: QuizResult }) {
  const verdict = getVerdict(result);
  const badge = getBadge(result);

  return (
    <section className="relative overflow-hidden border-b">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_70%_at_50%_0%,var(--glow),transparent)]"
      />
      <div className="relative mx-auto max-w-3xl px-6 py-10 sm:py-14">
        <Link
          href={`/quizzes/${result.slug}`}
          className="inline-flex max-w-full items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeftIcon className="size-4 shrink-0" />
          <span className="truncate">{result.title}</span>
        </Link>

        <div className="mt-8 flex flex-col items-center gap-8 text-center">
          <div className="space-y-4">
            {badge && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${badge.className}`}>
                <badge.Icon aria-hidden className="size-4" />
                {badge.label}
              </span>
            )}
            <h1 className="text-4xl sm:text-5xl">{verdict.title}</h1>
            <p className="mx-auto max-w-md text-lg text-muted-foreground">
              {verdict.text}
            </p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="animate-pop">
              <ScoreRing percentage={result.percentage} size="lg" animate />
            </div>
            <p className="font-display text-xl font-bold tabular-nums">
              {result.score} of {result.total} correct
            </p>
            {result.xpTotal > 0 && (
              <XpChip className="px-4 py-1.5 text-base">
                +{result.xpTotal} XP
              </XpChip>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href={`/quizzes/${result.slug}/review`}
              className={buttonVariants({
                size: "lg",
                className: "shadow-primary",
              })}>
              <ListChecksIcon />
              Review answers
            </Link>
            <Link
              href={`/quizzes/${result.slug}/play`}
              className={buttonVariants({ size: "lg", variant: "outline" })}>
              <RotateCcwIcon />
              Play again
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
