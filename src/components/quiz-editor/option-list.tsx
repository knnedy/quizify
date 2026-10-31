import { CheckIcon, PlusIcon, XIcon } from "lucide-react";
import { Keycap } from "@/components/keycap";
import { limits, type QuestionErrors } from "@/lib/quiz-editor-rules";
import { cn } from "@/lib/utils";
import type { EditorQuestion } from "@/types/quiz-editor";
import { FormBlock } from "../form/form-block";

export function OptionList({
  question,
  errors,
  showErrors,
  onEdit,
  onToggle,
  onRemove,
  onAdd,
}: {
  question: EditorQuestion;
  errors: QuestionErrors;
  showErrors: boolean;
  onEdit: (optionKey: string, label: string) => void;
  onToggle: (optionKey: string) => void;
  onRemove: (optionKey: string) => void;
  onAdd: () => void;
}) {
  const locked = question.type === "TRUE_FALSE";
  const canRemove = !locked && question.options.length > limits.optionsMin;
  const canAdd = !locked && question.options.length < limits.optionsMax;

  const hint = locked
    ? "Choose which one is correct."
    : question.type === "MULTIPLE"
      ? "Mark every correct answer."
      : "Mark the one correct answer.";

  return (
    <FormBlock
      label="Answers"
      hint={hint}
      error={showErrors ? (errors.options ?? errors.correct) : undefined}>
      <ul className="space-y-2.5">
        {question.options.map((option, index) => {
          const letter = String.fromCharCode(65 + index);
          const empty = showErrors && errors.emptyOptions.includes(option.key);

          return (
            <li
              key={option.key}
              className={cn(
                "flex items-center gap-3 rounded-2xl border p-2.5 pr-3 transition-colors focus-within:border-ring",
                option.isCorrect ? "border-correct bg-correct-soft" : "bg-card",
                empty && "border-incorrect",
              )}>
              <Keycap
                className={cn(
                  "h-9 min-w-9 shrink-0 rounded-lg text-base",
                  option.isCorrect && "border-correct bg-correct text-white",
                )}>
                {letter}
              </Keycap>

              {locked ? (
                <span className="min-w-0 flex-1 px-1 text-lg font-medium">
                  {option.label}
                </span>
              ) : (
                <textarea
                  value={option.label}
                  rows={Math.min(
                    4,
                    Math.max(1, Math.ceil(option.label.length / 48)),
                  )}
                  maxLength={limits.optionMax}
                  aria-label={`Answer ${letter}`}
                  aria-invalid={empty}
                  placeholder="Type an answer"
                  onChange={(event) =>
                    onEdit(option.key, event.target.value.replace(/\n/g, " "))
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") event.preventDefault();
                  }}
                  className="field-sizing-content min-w-0 flex-1 resize-none bg-transparent px-1 py-1.5 text-base leading-snug font-medium outline-none placeholder:font-normal placeholder:text-muted-foreground sm:text-lg"
                />
              )}

              <button
                type="button"
                aria-pressed={option.isCorrect}
                aria-label={`Answer ${letter} is correct`}
                onClick={() => onToggle(option.key)}
                className={cn(
                  "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  option.isCorrect
                    ? "border-correct bg-correct text-white"
                    : "bg-card text-muted-foreground hover:border-foreground/25 hover:text-foreground",
                )}>
                <CheckIcon aria-hidden className="size-4 stroke-3" />
                <span className="hidden sm:inline">Correct</span>
              </button>

              {!locked && (
                <button
                  type="button"
                  aria-label={`Remove answer ${letter}`}
                  disabled={!canRemove}
                  onClick={() => onRemove(option.key)}
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-incorrect-soft hover:text-incorrect-ink focus-visible:outline-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-30">
                  <XIcon aria-hidden className="size-4" />
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {!locked && (
        <button
          type="button"
          disabled={!canAdd}
          onClick={onAdd}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-muted/50 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50">
          <PlusIcon aria-hidden className="size-4" />
          {canAdd
            ? `Add answer (${question.options.length} of ${limits.optionsMax})`
            : `Answers are capped at ${limits.optionsMax}`}
        </button>
      )}
    </FormBlock>
  );
}
