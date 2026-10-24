import type { ReactNode } from "react";
import Link from "next/link";
import { LogInIcon, PlayIcon, StarIcon } from "lucide-react";
import { XpChip } from "@/components/xp-chip";
import { buttonVariants } from "@/components/ui/button";
import type { QuizDetail, Viewer } from "../mock-data";

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
  viewer,
}: {
  quiz: QuizDetail;
  viewer: Viewer;
}) {
  const playHref = `/quizzes/${quiz.slug}/play`;
  const signInHref = `/sign-in?redirect=${encodeURIComponent(playHref)}`;

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
        {viewer === "guest" ? (
          <Link
            href={signInHref}
            className={buttonVariants({ size: "lg", className: "w-full" })}>
            <LogInIcon />
            Sign in to play
          </Link>
        ) : (
          <Link
            href={playHref}
            className={buttonVariants({ size: "lg", className: "w-full" })}>
            <PlayIcon className="fill-current" />
            {viewer === "returning" ? "Play again" : "Start quiz"}
          </Link>
        )}

        <div className="flex flex-col items-center gap-3 text-center">
          <XpChip>Up to {quiz.xpReward} XP</XpChip>
          {viewer === "guest" && (
            <p className="text-sm text-muted-foreground">
              Sign in to save your score, earn XP and join the leaderboard.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
