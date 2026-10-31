import { useId, type ReactNode } from "react";
import { ArrowDownIcon, ArrowUpIcon, CopyIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import type { EditorActions } from "@/hooks/use-quiz-editor";
import {
  limits,
  questionTypeLabels,
  questionTypes,
  validateQuestion,
} from "@/lib/quiz-editor-rules";
import { cn } from "@/lib/utils";
import type { EditorQuestion } from "@/types/quiz-editor";
import { FormBlock, inputClass } from "../form/form-block";
import { OptionList } from "./option-list";
import { Segmented } from "../form/segmented";

const typeOptions = questionTypes.map((value) => ({
  value,
  label: questionTypeLabels[value],
}));

function IconButton({
  label,
  onClick,
  disabled,
  danger = false,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-lg border bg-card text-muted-foreground shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-40",
        danger
          ? "hover:border-incorrect/40 hover:bg-incorrect-soft hover:text-incorrect-ink"
          : "hover:border-foreground/25 hover:bg-muted/60 hover:text-foreground",
      )}>
      {children}
    </button>
  );
}

export function QuestionEditor({
  question,
  index,
  total,
  showErrors,
  actions,
}: {
  question: EditorQuestion;
  index: number;
  total: number;
  showErrors: boolean;
  actions: EditorActions;
}) {
  const titleId = useId();
  const explanationId = useId();
  const errors = validateQuestion(question);

  function remove() {
    actions.removeQuestion(question.key);
    toast("Question deleted", {
      action: {
        label: "Undo",
        onClick: () => actions.restoreQuestion(question, index),
      },
    });
  }

  return (
    <div className="animate-in space-y-8 duration-200 fade-in slide-in-from-bottom-1">
      <header className="flex flex-wrap items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary font-display text-lg font-bold text-primary-foreground shadow-primary tabular-nums">
          {index + 1}
        </span>
        <span className="text-sm font-medium text-muted-foreground tabular-nums">
          of {total}
        </span>

        <div className="ml-auto flex items-center gap-1.5">
          <IconButton
            label="Move up"
            disabled={index === 0}
            onClick={() => actions.moveQuestion(question.key, -1)}>
            <ArrowUpIcon aria-hidden className="size-4" />
          </IconButton>
          <IconButton
            label="Move down"
            disabled={index === total - 1}
            onClick={() => actions.moveQuestion(question.key, 1)}>
            <ArrowDownIcon aria-hidden className="size-4" />
          </IconButton>
          <IconButton
            label="Duplicate"
            disabled={total >= limits.questionsMax}
            onClick={() => actions.duplicateQuestion(question.key)}>
            <CopyIcon aria-hidden className="size-4" />
          </IconButton>
          <IconButton label="Delete" danger onClick={remove}>
            <Trash2Icon aria-hidden className="size-4" />
          </IconButton>
        </div>
      </header>

      <FormBlock label="Question type">
        <Segmented
          label="Question type"
          value={question.type}
          options={typeOptions}
          onChange={(type) => actions.setQuestionType(question.key, type)}
        />
      </FormBlock>

      <FormBlock
        label="Question"
        htmlFor={titleId}
        error={showErrors ? errors.title : undefined}
        hint={`Up to ${limits.questionMax} characters.`}>
        <textarea
          id={titleId}
          rows={3}
          autoFocus={question.title === ""}
          value={question.title}
          maxLength={limits.questionMax}
          placeholder="Which planet has the most known moons?"
          aria-invalid={showErrors && Boolean(errors.title)}
          onChange={(event) =>
            actions.editQuestion(question.key, { title: event.target.value })
          }
          className={cn(
            inputClass,
            "resize-y font-display text-xl leading-snug font-semibold",
          )}
        />
      </FormBlock>

      <OptionList
        question={question}
        errors={errors}
        showErrors={showErrors}
        onEdit={(optionKey, label) =>
          actions.editOption(question.key, optionKey, label)
        }
        onToggle={(optionKey) => actions.toggleCorrect(question.key, optionKey)}
        onRemove={(optionKey) => actions.removeOption(question.key, optionKey)}
        onAdd={() => actions.addOption(question.key)}
      />

      <FormBlock
        label="Explanation"
        optional
        htmlFor={explanationId}
        hint="Players see this in the review after they finish.">
        <textarea
          id={explanationId}
          rows={3}
          value={question.explanation}
          maxLength={limits.explanationMax}
          placeholder="Saturn leads the count with well over a hundred confirmed moons."
          onChange={(event) =>
            actions.editQuestion(question.key, {
              explanation: event.target.value,
            })
          }
          className={cn(inputClass, "resize-y")}
        />
      </FormBlock>
    </div>
  );
}
