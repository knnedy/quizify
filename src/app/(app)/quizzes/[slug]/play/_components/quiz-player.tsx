"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, ArrowRightIcon, SendIcon } from "lucide-react";
import { Keycap } from "@/components/keycap";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useCountdown } from "../_hooks/use-countdown";
import { usePlayHotkeys } from "../_hooks/use-play-hotkeys";
import { usePlaySession } from "../_hooks/use-play-session";
import type { PlayQuestion } from "../mock-data";
import { PlayProgress } from "./play-progress";
import { TimerClock, TimerLine } from "./play-timer";
import { QuestionPanel } from "./question-panel";
import { SubmitStep } from "./submit-step";

type Phase = "playing" | "submitting" | "timed-out";

export function QuizPlayer({
  slug,
  title,
  timeLimitSeconds,
  questions,
}: {
  slug: string;
  title: string;
  timeLimitSeconds: number | null;
  questions: PlayQuestion[];
}) {
  const router = useRouter();
  const session = usePlaySession(questions);
  const [phase, setPhase] = useState<Phase>("playing");
  const submittedRef = useRef(false);
  const finished = phase !== "playing";

  function submit(reason: "manual" | "timed-out") {
    if (submittedRef.current) return;
    submittedRef.current = true;

    setPhase(reason === "manual" ? "submitting" : "timed-out");
    router.push(`/quizzes/${slug}/results`);
  }

  const remaining = useCountdown({
    totalSeconds: timeLimitSeconds,
    running: !finished,
    onExpire: () => submit("timed-out"),
  });

  const { question } = session;

  usePlayHotkeys({
    enabled: !finished,
    optionCount: question?.options.length ?? 0,
    onSelect: (index) => {
      const option = question?.options[index];
      if (option) session.select(option.id);
    },
    onNext: session.onSubmitStep ? undefined : session.next,
    onPrevious: session.previous,
  });

  if (finished) {
    return (
      <div
        role="status"
        className="flex flex-col items-center gap-4 rounded-2xl border bg-card px-6 py-16 text-center shadow-sm">
        <Spinner className="size-6 text-primary" />
        <div className="space-y-1">
          <h1 className="text-2xl">
            {phase === "timed-out" ? "Time's up" : "Submitting your answers"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {phase === "timed-out"
              ? "Sending what you have. Unanswered questions count as incorrect."
              : "One moment while we score your quiz."}
          </p>
        </div>
      </div>
    );
  }

  const timed = remaining !== null && timeLimitSeconds !== null;
  const isLast = session.current === session.total - 1;
  const currentAnswered = question ? session.isAnswered(question.id) : true;
  const emphasised = currentAnswered || isLast;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <Link
          href={`/quizzes/${slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeftIcon className="size-4" />
          Exit
        </Link>
        <p className="truncate text-sm font-medium text-muted-foreground">
          {title}
        </p>
      </div>

      <div className="relative overflow-hidden rounded-2xl border bg-card shadow-sm">
        {timed && <TimerLine remaining={remaining} total={timeLimitSeconds} />}

        <div className="space-y-6 p-6 pt-7 sm:p-8 sm:pt-9">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-muted-foreground">
                {session.onSubmitStep
                  ? "Review your answers"
                  : `Question ${session.current + 1} of ${session.total}`}
              </span>
              {timed ? (
                <TimerClock remaining={remaining} total={timeLimitSeconds} />
              ) : (
                <span className="font-medium text-muted-foreground tabular-nums">
                  {session.answeredCount} of {session.total} answered
                </span>
              )}
            </div>
            <PlayProgress
              questions={questions}
              isAnswered={session.isAnswered}
              current={session.current}
              onJump={session.goTo}
            />
          </div>

          {question ? (
            <QuestionPanel
              key={question.id}
              question={question}
              selected={session.answers[question.id] ?? []}
              onSelect={session.select}
            />
          ) : (
            <SubmitStep
              key="submit"
              total={session.total}
              answered={session.answeredCount}
              unanswered={session.unanswered}
              timed={timed}
              onJump={session.goTo}
            />
          )}

          <div className="flex items-center justify-between gap-3 border-t pt-5">
            <Button
              variant="outline"
              onClick={session.previous}
              disabled={session.current === 0}>
              <ArrowLeftIcon />
              Back
            </Button>

            {!session.onSubmitStep && (
              <p className="hidden items-center gap-1.5 text-xs text-muted-foreground md:flex">
                <Keycap className="h-5 min-w-5 text-[11px]">A</Keycap>
                to
                <Keycap className="h-5 min-w-5 text-[11px]">D</Keycap>
                answer
                <Keycap className="h-5 min-w-5 text-[11px]">←</Keycap>
                <Keycap className="h-5 min-w-5 text-[11px]">→</Keycap>
                move
                <Keycap className="h-5 min-w-5 text-[11px]">↵</Keycap>
                next
              </p>
            )}

            {session.onSubmitStep ? (
              <Button
                className="shadow-primary"
                onClick={() => submit("manual")}>
                <SendIcon />
                Submit answers
              </Button>
            ) : (
              <Button
                variant={emphasised ? "default" : "outline"}
                className={cn(emphasised && "shadow-primary")}
                onClick={session.next}>
                {isLast
                  ? "Review and submit"
                  : currentAnswered
                    ? "Next"
                    : "Skip"}
                <ArrowRightIcon />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
