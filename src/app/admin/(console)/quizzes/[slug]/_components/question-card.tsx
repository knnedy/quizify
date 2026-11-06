import {
  CheckIcon,
  FlagIcon,
  LightbulbIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Keycap } from "@/components/keycap";
import { shouldStackOptions } from "@/lib/question-layout";
import { cn } from "@/lib/utils";
import type { PreviewQuestion, QuestionType } from "../mock-data";
import { Highlight } from "./highlight";

const typeLabels: Record<QuestionType, string> = {
  SINGLE: "Single answer",
  MULTIPLE: "Multiple answers",
  TRUE_FALSE: "True or false",
};

export function QuestionCard({
  question,
  term,
  mentions,
  showExplanation,
}: {
  question: PreviewQuestion;
  term: string;
  mentions: number;
  showExplanation: boolean;
}) {
  const stacked = shouldStackOptions(question);
  const hasCorrect = question.options.some((option) => option.isCorrect);
  const titleId = `question-${question.number}-title`;

  return (
    <article
      id={`question-${question.number}`}
      aria-labelledby={titleId}
      className={cn(
        "scroll-mt-44 space-y-5 rounded-2xl border bg-card p-5 shadow-xs sm:p-6",
        mentions > 0 && "border-streak/40",
      )}>
      <header className="flex flex-wrap items-center gap-2.5">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary font-display text-lg font-bold text-primary-foreground tabular-nums">
          {question.number}
        </span>
        <span className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
          {typeLabels[question.type]}
        </span>

        {mentions > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-streak-soft px-3 py-1 text-sm font-semibold text-streak-ink">
            <FlagIcon aria-hidden className="size-3.5" />
            Mentioned in {mentions} {mentions === 1 ? "report" : "reports"}
          </span>
        )}
        {!hasCorrect && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-incorrect-soft px-3 py-1 text-sm font-semibold text-incorrect-ink">
            <TriangleAlertIcon aria-hidden className="size-3.5" />
            No correct answer marked
          </span>
        )}
      </header>

      <h3 id={titleId} className="text-xl leading-snug sm:text-2xl">
        <Highlight text={question.title} term={term} />
      </h3>

      <ul
        className={cn(
          "grid gap-2.5",
          !stacked &&
            "sm:grid-cols-2 sm:[&>li:last-child:nth-child(odd)]:col-span-2",
        )}>
        {question.options.map((option, index) => (
          <li
            key={`${index}-${option.label}`}
            className={cn(
              "flex items-center gap-3.5 rounded-xl border px-4 py-3 font-medium",
              option.isCorrect
                ? "border-correct bg-correct-soft text-correct-ink"
                : "bg-card",
            )}>
            <Keycap
              className={cn(
                "h-8 min-w-8 shrink-0 rounded-lg text-sm",
                option.isCorrect && "border-correct bg-correct text-white",
              )}>
              {option.isCorrect ? (
                <CheckIcon aria-hidden className="size-4 stroke-3" />
              ) : (
                String.fromCharCode(65 + index)
              )}
            </Keycap>
            <span className="min-w-0 flex-1">
              <span className="block wrap-break-word">
                <Highlight text={option.label} term={term} />
              </span>
              {option.isCorrect && (
                <span className="mt-0.5 block text-sm font-normal">
                  Correct answer
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>

      {showExplanation &&
        (question.explanation ? (
          <div className="flex gap-3 rounded-xl bg-muted/50 px-4 py-3.5">
            <LightbulbIcon
              aria-hidden
              className="mt-0.5 size-4.5 shrink-0 text-xp"
            />
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              <span className="sr-only">Explanation: </span>
              <Highlight text={question.explanation} term={term} />
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            No explanation written.
          </p>
        ))}
    </article>
  );
}
