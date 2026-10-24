import { CheckIcon } from "lucide-react";
import { Keycap } from "@/components/keycap";
import { cn } from "@/lib/utils";
import type { PlayQuestion, QuestionType } from "../mock-data";

const hints: Record<QuestionType, string> = {
  SINGLE: "Choose one answer.",
  MULTIPLE: "Select all that apply.",
  TRUE_FALSE: "True or false.",
};

export function QuestionPanel({
  question,
  selected,
  onSelect,
}: {
  question: PlayQuestion;
  selected: number[];
  onSelect: (optionId: number) => void;
}) {
  const multiple = question.type === "MULTIPLE";

  return (
    <div className="animate-in space-y-6 duration-200 fade-in slide-in-from-bottom-1">
      <div className="space-y-2">
        <h2 className="text-2xl leading-snug sm:text-3xl">{question.title}</h2>
        <p className="text-sm text-muted-foreground">{hints[question.type]}</p>
      </div>

      <div
        role={multiple ? "group" : "radiogroup"}
        aria-label="Answer options"
        className={cn(
          question.type === "TRUE_FALSE"
            ? "grid gap-2.5 sm:grid-cols-2"
            : "space-y-2.5",
        )}>
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
                "flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-base font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                isSelected
                  ? "border-primary bg-primary-soft"
                  : "bg-card hover:border-foreground/25 hover:bg-muted/60",
              )}>
              <Keycap
                className={cn(
                  "h-7 min-w-7 text-sm",
                  isSelected &&
                    "border-primary bg-primary text-primary-foreground",
                )}>
                {String.fromCharCode(65 + index)}
              </Keycap>
              <span className="flex-1">{option.label}</span>
              {multiple && (
                <span
                  aria-hidden
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input",
                  )}>
                  {isSelected && <CheckIcon className="size-3.5 stroke-3" />}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
