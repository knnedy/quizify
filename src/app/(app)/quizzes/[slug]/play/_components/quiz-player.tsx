"use client";

import { useRef, useState, type ReactNode } from "react";
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
import { FocusToggle } from "./focus-toggle";
import { PlayProgress } from "./play-progress";
import { TimerClock, TimerLine } from "./play-timer";
import { QuestionPanel } from "./question-panel";
import { SubmitStep } from "./submit-step";

type Phase = "playing" | "submitting" | "timed-out";

function Shell({
  focused,
  children,
}: {
  focused: boolean;
  children: ReactNode;
}) {
  if (!focused) {
    return <div className="flex flex-col gap-8">{children}</div>;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Focused quiz view"
      className="fixed inset-0 z-60 overflow-y-auto overscroll-contain bg-background">
      <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col gap-8 px-6 py-6 sm:py-10">
        {children}
      </div>
    </div>
  );
}

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
  const [focused, setFocused] = useState(false);
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
    focused,
    onToggleFocus: () => setFocused((value) => !value),
  });

  const timed = remaining !== null && timeLimitSeconds !== null;

  if (finished) {
    return (
      <Shell focused={focused}>
        <div
          role="status"
          className="my-auto flex flex-col items-center gap-4 rounded-2xl border bg-card px-6 py-16 text-center shadow-sm">
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
      </Shell>
    );
  }

  const isLast = session.current === session.total - 1;
  const currentAnswered = question ? session.isAnswered(question.id) : true;
  const emphasised = currentAnswered || isLast;

  return (
    <>
      {timed && <TimerLine remaining={remaining} total={timeLimitSeconds} />}

      <Shell focused={focused}>
        <header className="flex items-center justify-between gap-3">
          <Link
            href={`/quizzes/${slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeftIcon className="size-4" />
            Exit
          </Link>

          <p className="hidden min-w-0 flex-1 truncate text-center text-sm font-medium text-muted-foreground sm:block">
            {title}
          </p>

          <div className="flex items-center gap-2">
            {timed ? (
              <TimerClock remaining={remaining} total={timeLimitSeconds} />
            ) : (
              <span className="rounded-full bg-muted px-3 py-1.5 font-display text-sm font-semibold text-muted-foreground tabular-nums">
                {session.answeredCount}/{session.total} answered
              </span>
            )}
            <FocusToggle
              focused={focused}
              onToggle={() => setFocused((value) => !value)}
            />
          </div>
        </header>

        <PlayProgress
          questions={questions}
          isAnswered={session.isAnswered}
          current={session.current}
          onJump={session.goTo}
        />

        {question ? (
          <QuestionPanel
            key={question.id}
            question={question}
            number={session.current + 1}
            total={session.total}
            selected={session.answers[question.id] ?? []}
            focused={focused}
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

        <footer className="mt-auto flex items-center justify-between gap-3 border-t pt-6">
          <Button
            variant="outline"
            size="lg"
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
              size="lg"
              className="shadow-primary"
              onClick={() => submit("manual")}>
              <SendIcon />
              Submit answers
            </Button>
          ) : (
            <Button
              size="lg"
              variant={emphasised ? "default" : "outline"}
              className={cn(emphasised && "shadow-primary")}
              onClick={session.next}>
              {isLast ? "Review and submit" : currentAnswered ? "Next" : "Skip"}
              <ArrowRightIcon />
            </Button>
          )}
        </footer>
      </Shell>
    </>
  );
}
