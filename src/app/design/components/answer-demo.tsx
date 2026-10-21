"use client";

import { useState } from "react";
import { CheckIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const options = ["Mars", "Jupiter", "Saturn", "Neptune"];
const letters = ["A", "B", "C", "D"];
const correctIndex = 2;

export function AnswerDemo() {
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);

  function reset() {
    setSelected(null);
    setChecked(false);
  }

  const gotItRight = selected === correctIndex;

  return (
    <div className="mx-auto w-full max-w-xl space-y-6 rounded-2xl border bg-card p-6 shadow-card sm:p-8">
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Question 3 of 10</span>
          <span className="font-display text-base font-semibold text-foreground tabular-nums">
            01:42
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-[30%] rounded-full bg-primary" />
        </div>
      </div>

      <h3 className="font-display text-2xl font-semibold">
        Which planet has the most known moons?
      </h3>

      <div
        role="radiogroup"
        aria-label="Answer options"
        className="space-y-2.5">
        {options.map((option, index) => {
          const isSelected = selected === index;
          const isCorrect = checked && index === correctIndex;
          const isWrong = checked && isSelected && index !== correctIndex;
          const isDimmed = checked && !isCorrect && !isWrong;

          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={checked}
              onClick={() => setSelected(index)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border-2 bg-card px-4 py-3 text-left text-base transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-default",
                !checked &&
                  !isSelected &&
                  "border-border hover:border-primary/50 hover:bg-accent/50",
                !checked && isSelected && "border-primary bg-accent",
                isCorrect &&
                  "animate-pop border-correct bg-correct-soft text-correct",
                isWrong &&
                  "animate-shake border-incorrect bg-incorrect-soft text-incorrect",
                isDimmed && "opacity-60",
              )}>
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold",
                  !checked &&
                    !isSelected &&
                    "border-border text-muted-foreground",
                  !checked &&
                    isSelected &&
                    "border-primary bg-primary text-primary-foreground",
                  isCorrect && "border-correct bg-correct text-background",
                  isWrong && "border-incorrect bg-incorrect text-background",
                  isDimmed && "border-border text-muted-foreground",
                )}>
                {letters[index]}
              </span>
              <span className="flex-1">
                <span className={cn(isSelected && !checked && "highlighter")}>
                  {option}
                </span>
              </span>
              {isCorrect && <CheckIcon className="size-5" />}
              {isWrong && <XIcon className="size-5" />}
            </button>
          );
        })}
      </div>

      {checked && (
        <p
          role="status"
          className={cn(
            "rounded-xl px-4 py-3 text-sm font-medium",
            gotItRight
              ? "bg-correct-soft text-correct"
              : "bg-incorrect-soft text-incorrect",
          )}>
          {gotItRight
            ? "Correct. You earned 50 XP."
            : "Not quite. Saturn has the most known moons."}
        </p>
      )}

      {checked ? (
        <Button variant="outline" size="lg" className="w-full" onClick={reset}>
          Try again
        </Button>
      ) : (
        <Button
          size="lg"
          className="w-full"
          disabled={selected === null}
          onClick={() => setChecked(true)}>
          Check answer
        </Button>
      )}
    </div>
  );
}
