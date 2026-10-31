"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckIcon, ClockIcon, XIcon, ZapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Keycap } from "../keycap";

const question = {
  title: "Which planet has the most known moons?",
  options: ["Mars", "Jupiter", "Saturn", "Neptune"],
  correctIndex: 2,
  explanation:
    "Saturn leads the count with well over a hundred confirmed moons.",
};

const letters = ["A", "B", "C", "D"];
const TOTAL_SECONDS = 20;
const TOTAL_QUESTIONS = 10;
const earlierResults = ["correct", "correct"] as const;

type SegmentState = "correct" | "incorrect" | "current" | "pending";

const segmentClasses: Record<SegmentState, string> = {
  correct: "bg-correct",
  incorrect: "bg-incorrect",
  current: "bg-primary",
  pending: "bg-border",
};

function indexFromKey(key: string) {
  const letterIndex = letters.indexOf(key.toUpperCase());
  if (letterIndex !== -1) return letterIndex;
  const digitIndex = Number(key) - 1;
  return Number.isInteger(digitIndex) ? digitIndex : -1;
}

export function QuizDemo() {
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [remaining, setRemaining] = useState(TOTAL_SECONDS);

  const revealed = checked || remaining <= 0;
  const gotItRight = revealed && selected === question.correctIndex;

  const reset = useCallback(() => {
    setSelected(null);
    setChecked(false);
    setRemaining(TOTAL_SECONDS);
  }, []);

  useEffect(() => {
    if (revealed) return;
    const id = window.setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => window.clearTimeout(id);
  }, [revealed, remaining]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (event.key === "Enter") {
        if (revealed) {
          event.preventDefault();
          reset();
        } else if (selected !== null) {
          event.preventDefault();
          setChecked(true);
        }
        return;
      }

      if (revealed) return;
      const index = indexFromKey(event.key);
      if (index >= 0 && index < question.options.length) setSelected(index);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [revealed, selected, reset]);

  const segments: SegmentState[] = Array.from(
    { length: TOTAL_QUESTIONS },
    (_, i) => {
      if (i < earlierResults.length) return earlierResults[i];
      if (i === earlierResults.length) {
        if (!revealed) return "current";
        return gotItRight ? "correct" : "incorrect";
      }
      return "pending";
    },
  );

  const timerFill =
    remaining <= 5
      ? "bg-incorrect"
      : remaining <= 10
        ? "bg-streak"
        : "bg-primary";
  const timerText =
    remaining <= 5
      ? "text-incorrect-ink"
      : remaining <= 10
        ? "text-streak-ink"
        : "text-muted-foreground";

  return (
    <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="absolute inset-x-0 top-0 h-1 bg-muted">
        <div
          className={cn(
            "h-full transition-[width,background-color] duration-1000 ease-linear",
            timerFill,
          )}
          style={{ width: `${(remaining / TOTAL_SECONDS) * 100}%` }}
        />
      </div>

      <div className="space-y-6 p-6 pt-7 sm:p-7 sm:pt-8">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-muted-foreground">
              Question {earlierResults.length + 1} of {TOTAL_QUESTIONS}
            </span>
            <span
              className={cn(
                "flex items-center gap-1.5 font-semibold tabular-nums",
                timerText,
              )}>
              <ClockIcon className="size-4" />
              0:
              {String(remaining).padStart(2, "0")}
            </span>
          </div>
          <div className="flex gap-1.5">
            {segments.map((state, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors",
                  segmentClasses[state],
                )}
              />
            ))}
          </div>
        </div>

        <h3 className="font-display text-2xl leading-snug font-bold">
          {question.title}
        </h3>

        <div
          role="radiogroup"
          aria-label="Answer options"
          className="space-y-2.5">
          {question.options.map((label, index) => {
            const isSelected = selected === index;
            const isCorrect = revealed && index === question.correctIndex;
            const isWrong =
              revealed && isSelected && index !== question.correctIndex;
            const isDimmed = revealed && !isCorrect && !isWrong;

            return (
              <button
                key={label}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={revealed}
                onClick={() => setSelected(index)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-base font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-default",
                  !revealed &&
                    !isSelected &&
                    "bg-card hover:border-foreground/25 hover:bg-muted/60",
                  !revealed && isSelected && "border-primary bg-primary-soft",
                  isCorrect &&
                    "animate-pop border-correct bg-correct-soft text-correct-ink",
                  isWrong &&
                    "animate-shake border-incorrect bg-incorrect-soft text-incorrect-ink",
                  isDimmed && "bg-card text-muted-foreground opacity-60",
                )}>
                <Keycap
                  className={cn(
                    "h-7 min-w-7 text-sm",
                    !revealed &&
                      isSelected &&
                      "border-primary bg-primary text-primary-foreground",
                    isCorrect && "border-correct bg-correct text-white",
                    isWrong && "border-incorrect bg-incorrect text-white",
                  )}>
                  {isCorrect ? (
                    <CheckIcon className="size-4 stroke-3" />
                  ) : isWrong ? (
                    <XIcon className="size-4 stroke-3" />
                  ) : (
                    letters[index]
                  )}
                </Keycap>
                <span className="flex-1">{label}</span>
              </button>
            );
          })}
        </div>

        {revealed && (
          <div
            role="status"
            className={cn(
              "animate-in space-y-1 rounded-xl border px-4 py-3 duration-200 fade-in slide-in-from-bottom-1",
              gotItRight
                ? "border-correct/30 bg-correct-soft text-correct-ink"
                : "border-incorrect/30 bg-incorrect-soft text-incorrect-ink",
            )}>
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold">
                {selected === null
                  ? "Time's up"
                  : gotItRight
                    ? "Correct"
                    : "Not quite"}
              </p>
              {gotItRight && (
                <span className="inline-flex animate-pop items-center gap-1 rounded-full bg-xp-soft px-2.5 py-1 text-sm font-semibold text-xp-ink">
                  <ZapIcon className="size-3.5" />
                  +50 XP
                </span>
              )}
            </div>
            <p className="text-sm">{question.explanation}</p>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <p className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
            <Keycap className="h-5 min-w-5 text-[11px]">A</Keycap>
            to
            <Keycap className="h-5 min-w-5 text-[11px]">D</Keycap>
            answer
            <Keycap className="h-5 min-w-5 text-[11px]">↵</Keycap>
            {revealed ? "retry" : "check"}
          </p>
          {revealed ? (
            <Button variant="outline" className="ml-auto" onClick={reset}>
              Try again
            </Button>
          ) : (
            <Button
              className="ml-auto shadow-primary"
              disabled={selected === null}
              onClick={() => setChecked(true)}>
              Check answer
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
