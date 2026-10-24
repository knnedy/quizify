import { CheckIcon } from "lucide-react";
import { Keycap } from "@/components/keycap";
import { cn } from "@/lib/utils";
import type { PlayQuestion, QuestionType } from "../mock-data";

const hints: Record<QuestionType, string> = {
  SINGLE: "Choose one answer",
  MULTIPLE: "Select all that apply",
  TRUE_FALSE: "True or false",
};

const LONG_OPTION_LENGTH = 40;

export function QuestionPanel({
  question,
  number,
  total,
  selected,
  focused = false,
  onSelect,
}: {
  question: PlayQuestion;
  number: number;
  total: number;
  selected: number[];
  focused?: boolean;
  onSelect: (optionId: number) => void;
}) {
  const multiple = question.type === "MULTIPLE";
  const trueFalse = question.type === "TRUE_FALSE";
  const stacked =
    !trueFalse &&
    question.options.some((option) => option.label.length > LONG_OPTION_LENGTH);

  return (
    <div className="animate-in space-y-8 duration-200 fade-in slide-in-from-bottom-1">
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary font-display text-lg font-bold text-primary-foreground shadow-primary tabular-nums">
            {number}
          </span>
          <span className="text-sm font-medium text-muted-foreground tabular-nums">
            of {total}
          </span>
          <span className="ml-auto rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
            {hints[question.type]}
          </span>
        </div>

        <h2
          className={cn(
            "leading-tight",
            focused ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl",
          )}>
          {question.title}
        </h2>
      </div>

      <div
        role={multiple ? "group" : "radiogroup"}
        aria-label="Answer options"
        className={cn("grid gap-3", !stacked && "sm:grid-cols-2")}>
        {question.options.map((option, index) => {
          const isSelected = selected.includes(option.id);

          return (
            <button
              key={option.id}
              type="button"
              role={multiple ? "checkbox" : "radio"}
              aria-checked={isSelected}
              data-option
              onClick={() => onSelect(option.id)}
              className={cn(
                "relative flex w-full items-center rounded-2xl border bg-card px-5 text-left font-medium shadow-xs transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.99]",
                !stacked && "sm:odd:last:col-span-2",
                trueFalse
                  ? "min-h-32 flex-col justify-center gap-3 text-center text-xl sm:text-2xl"
                  : "min-h-20 gap-4 py-4 text-base leading-snug sm:text-lg",
                isSelected
                  ? "animate-pop border-primary bg-primary-soft shadow-sm"
                  : "hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-sm",
              )}>
              <Keycap
                className={cn(
                  "h-9 min-w-9 shrink-0 rounded-lg text-base",
                  isSelected &&
                    "border-primary bg-primary text-primary-foreground",
                )}>
                {String.fromCharCode(65 + index)}
              </Keycap>
              <span
                className={cn(
                  "min-w-0 wrap-break-word",
                  !trueFalse && "flex-1",
                )}>
                {option.label}
              </span>
              {multiple && (
                <span
                  aria-hidden
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-md border transition-colors",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input",
                  )}>
                  {isSelected && <CheckIcon className="size-4 stroke-3" />}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
