"use client";

import type { ComponentType } from "react";
import {
  CheckIcon,
  ClockIcon,
  LightbulbIcon,
  MinusIcon,
  XIcon,
} from "lucide-react";
import { Keycap } from "@/components/keycap";
import { shouldStackOptions } from "@/lib/question-layout";
import { cn } from "@/lib/utils";
import { useInView } from "../_hooks/use-in-view";
import type {
  QuestionType,
  ReviewOption,
  ReviewQuestion,
  ReviewStatus,
} from "../mock-data";

type IconType = ComponentType<{ className?: string }>;
type OptionState = "right" | "wrong" | "missed" | "answer" | "neutral";

const statusConfig: Record<
  ReviewStatus,
  { label: string; Icon: IconType; tone: string; card: string }
> = {
  correct: {
    label: "Correct",
    Icon: CheckIcon,
    tone: "bg-correct-soft text-correct-ink",
    card: "",
  },
  incorrect: {
    label: "Incorrect",
    Icon: XIcon,
    tone: "bg-incorrect-soft text-incorrect-ink",
    card: "border-incorrect/30",
  },
  skipped: {
    label: "Not answered",
    Icon: MinusIcon,
    tone: "bg-muted text-muted-foreground",
    card: "border-dashed",
  },
};

const typeLabels: Record<QuestionType, string> = {
  SINGLE: "Single answer",
  MULTIPLE: "Multiple answers",
  TRUE_FALSE: "True or false",
};

const optionConfig: Record<
  OptionState,
  { tile: string; key: string; note: string | null; Icon: IconType | null }
> = {
  right: {
    tile: "border-correct bg-correct-soft text-correct-ink",
    key: "border-correct bg-correct text-white",
    note: "Your answer",
    Icon: CheckIcon,
  },
  wrong: {
    tile: "border-incorrect bg-incorrect-soft text-incorrect-ink",
    key: "border-incorrect bg-incorrect text-white",
    note: "Your answer",
    Icon: XIcon,
  },
  missed: {
    tile: "border-dashed border-correct bg-card text-correct-ink",
    key: "border-correct bg-card text-correct-ink",
    note: "You missed this",
    Icon: CheckIcon,
  },
  answer: {
    tile: "border-correct bg-correct-soft text-correct-ink",
    key: "border-correct bg-correct text-white",
    note: "Correct answer",
    Icon: CheckIcon,
  },
  neutral: {
    tile: "bg-card text-muted-foreground opacity-70",
    key: "",
    note: null,
    Icon: null,
  },
};

function getOptionState(
  question: ReviewQuestion,
  option: ReviewOption,
): OptionState {
  if (option.isSelected && option.isCorrect) return "right";
  if (option.isSelected) return "wrong";
  if (
    option.isCorrect &&
    question.type === "MULTIPLE" &&
    question.status !== "skipped"
  ) {
    return "missed";
  }
  if (option.isCorrect) return "answer";
  return "neutral";
}

export function ReviewQuestionCard({ question }: { question: ReviewQuestion }) {
  const { ref, inView } = useInView<HTMLElement>();
  const status = statusConfig[question.status];
  const stacked = shouldStackOptions(question);
  const titleId = `question-${question.number}-title`;

  return (
    <article
      ref={ref}
      id={`question-${question.number}`}
      aria-labelledby={titleId}
      className={cn(
        "scroll-mt-24 space-y-6 rounded-2xl border bg-card p-5 shadow-xs sm:p-7",
        status.card,
      )}>
      <header className="flex flex-wrap items-center gap-3">
        <span
          className={cn(
            "flex size-10 items-center justify-center rounded-xl font-display text-lg font-bold tabular-nums",
            status.tone,
          )}>
          {question.number}
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold",
            status.tone,
          )}>
          <status.Icon aria-hidden className="size-4" />
          {status.label}
        </span>
        <span className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
          {typeLabels[question.type]}
        </span>
        {question.timeSpentSeconds !== null && (
          <span
            title="Time spent"
            className="ml-auto inline-flex items-center gap-1.5 text-sm text-muted-foreground tabular-nums">
            <ClockIcon aria-hidden className="size-4" />
            {question.timeSpentSeconds}s
          </span>
        )}
      </header>

      <h2 id={titleId} className="text-xl leading-snug sm:text-2xl">
        {question.title}
      </h2>

      <ul className={cn("grid gap-3", !stacked && "sm:grid-cols-2")}>
        {question.options.map((option, index) => {
          const state = getOptionState(question, option);
          const config = optionConfig[state];
          const Icon = config.Icon;

          return (
            <li
              key={option.id}
              className={cn(
                "flex items-center gap-4 rounded-2xl border px-5 py-4 font-medium",
                !stacked && "sm:odd:last:col-span-2",
                config.tile,
                inView && state === "wrong" && "animate-shake",
                inView &&
                  (state === "right" || state === "answer") &&
                  "animate-pop",
              )}>
              <Keycap
                className={cn(
                  "h-9 min-w-9 shrink-0 rounded-lg text-base",
                  config.key,
                )}>
                {Icon ? (
                  <Icon className="size-4.5 stroke-3" />
                ) : (
                  String.fromCharCode(65 + index)
                )}
              </Keycap>
              <span className="min-w-0 flex-1">
                <span className="block text-base leading-snug wrap-break-word sm:text-lg">
                  {option.label}
                </span>
                {config.note && (
                  <span className="mt-0.5 block text-sm font-normal">
                    {config.note}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>

      {question.explanation && (
        <div className="flex gap-3 rounded-xl bg-muted/50 px-4 py-3.5">
          <LightbulbIcon
            aria-hidden
            className="mt-0.5 size-4.5 shrink-0 text-xp"
          />
          <p className="text-[15px] leading-relaxed text-muted-foreground">
            <span className="sr-only">Explanation: </span>
            {question.explanation}
          </p>
        </div>
      )}
    </article>
  );
}
