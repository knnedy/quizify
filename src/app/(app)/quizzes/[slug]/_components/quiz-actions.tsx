import type { ReactNode } from "react";
import Link from "next/link";
import { LogInIcon, StarIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { XpChip } from "@/components/xp-chip";
import type { QuizDetail } from "@/types/quiz";
import { StartButton } from "./start-button";

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col-reverse gap-1.5 bg-card px-4 py-3.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="flex h-6 items-center font-display text-xl leading-none font-bold tabular-nums">
        {children}
      </dd>
    </div>
  );
}

export function QuizActions({
  quiz,
  signedIn,
}: {
  quiz: QuizDetail;
  signedIn: boolean;
}) {
  const signInHref = `/sign-in?redirect=${encodeURIComponent(`/quizzes/${quiz.slug}`)}`;

  const exhausted =
    quiz.maxAttempts !== null &&
    quiz.attemptsUsed >= quiz.maxAttempts &&
    !quiz.hasActiveAttempt;

  const startLabel = quiz.hasActiveAttempt
    ? "Resume"
    : quiz.best
      ? "Play again"
      : "Start quiz";

  return (
    <div className="space-y-5 rounded-2xl border bg-card p-5 shadow-sm">
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border">
        <Stat label="questions">{quiz.questions}</Stat>
        <Stat label="time limit">
          {quiz.timeLimitMinutes ? `${quiz.timeLimitMinutes} min` : "None"}
        </Stat>
        <Stat label="plays">{compact.format(quiz.plays)}</Stat>
        <Stat label="rating">
          {quiz.avgRating !== null ? (
            <span className="flex items-center gap-1.5">
              <StarIcon className="size-4 fill-xp text-xp" />
              {quiz.avgRating.toFixed(1)}
            </span>
          ) : (
            <span className="rounded-full bg-primary-soft px-2.5 py-0.5 font-sans text-xs font-semibold text-primary">
              New
            </span>
          )}
        </Stat>
      </dl>

      <div className="space-y-3">
        {!signedIn ? (
          <Link
            href={signInHref}
            className={buttonVariants({ size: "lg", className: "w-full" })}>
            <LogInIcon />
            Sign in to play
          </Link>
        ) : exhausted ? (
          <Button size="lg" className="w-full" disabled>
            No attempts left
          </Button>
        ) : (
          <StartButton slug={quiz.slug} label={startLabel} />
        )}

        <div className="flex flex-col items-center gap-3 text-center">
          <XpChip>Up to {quiz.xpReward} XP</XpChip>
          {signedIn && quiz.maxAttempts !== null && (
            <p className="text-sm text-muted-foreground tabular-nums">
              {Math.min(quiz.attemptsUsed, quiz.maxAttempts)} of{" "}
              {quiz.maxAttempts} attempts used
            </p>
          )}
          {!signedIn && (
            <p className="text-sm text-muted-foreground">
              Sign in to save your score, earn XP and join the leaderboard.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
