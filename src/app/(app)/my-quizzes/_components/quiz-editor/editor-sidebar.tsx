import { useEffect, useRef, type ReactNode } from "react";
import {
  CheckIcon,
  CircleAlertIcon,
  CircleIcon,
  PlusIcon,
  SlidersHorizontalIcon,
} from "lucide-react";
import { Keycap } from "@/components/keycap";
import { Button } from "@/components/ui/button";
import {
  isQuestionComplete,
  limits,
  questionTypeLabels,
  validateSettings,
} from "@/lib/quiz-editor-rules";
import { cn } from "@/lib/utils";
import type {
  EditorQuestion,
  EditorSelection,
  QuizSettings,
} from "@/types/quiz-editor";

type Progress = "done" | "todo" | "problem";

const progressLabels: Record<Progress, string> = {
  done: "Complete",
  todo: "Not finished",
  problem: "Needs attention",
};

function getProgress(complete: boolean, showErrors: boolean): Progress {
  if (complete) return "done";
  return showErrors ? "problem" : "todo";
}

function ProgressIcon({ progress }: { progress: Progress }) {
  return (
    <>
      {progress === "done" && (
        <CheckIcon aria-hidden className="size-4 shrink-0 text-correct" />
      )}
      {progress === "todo" && (
        <CircleIcon
          aria-hidden
          className="size-4 shrink-0 text-muted-foreground/40"
        />
      )}
      {progress === "problem" && (
        <CircleAlertIcon aria-hidden className="size-4 shrink-0 text-streak" />
      )}
      <span className="sr-only">{progressLabels[progress]}</span>
    </>
  );
}

// Scrolls the container itself, never the page, so switching questions can't
// make the whole screen jump.
function reveal(container: HTMLElement | null, axis: "x" | "y") {
  const current = container?.querySelector<HTMLElement>(
    "[aria-current='true']",
  );
  if (!container || !current) return;

  if (axis === "x") {
    container.scrollTo({
      left:
        current.offsetLeft - (container.clientWidth - current.offsetWidth) / 2,
    });
  } else {
    container.scrollTo({
      top:
        current.offsetTop - (container.clientHeight - current.offsetHeight) / 2,
    });
  }
}

const rowClass =
  "flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring";

const numberClass =
  "flex size-8 shrink-0 items-center justify-center rounded-lg font-display text-sm font-bold tabular-nums";

export function EditorSidebar({
  settings,
  questions,
  selection,
  showErrors,
  onSelect,
  onAdd,
  footer,
}: {
  settings: QuizSettings;
  questions: EditorQuestion[];
  selection: EditorSelection;
  showErrors: boolean;
  onSelect: (selection: EditorSelection) => void;
  onAdd: () => void;
  footer: ReactNode;
}) {
  const stripRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const activeKey = selection.kind === "question" ? selection.key : "details";

  useEffect(() => {
    reveal(stripRef.current, "x");
    reveal(listRef.current, "y");
  }, [activeKey]);

  const detailsActive = selection.kind === "details";
  const detailsProgress = getProgress(
    Object.keys(validateSettings(settings)).length === 0,
    showErrors,
  );
  const atMax = questions.length >= limits.questionsMax;

  return (
    <>
      <nav
        ref={stripRef}
        aria-label="Quiz outline"
        className="relative -mx-6 overflow-x-auto px-6 pb-1 lg:hidden">
        <ul className="flex w-max gap-2">
          <li>
            <button
              type="button"
              aria-current={detailsActive ? "true" : undefined}
              onClick={() => onSelect({ kind: "details" })}
              className={cn(
                "inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border px-3.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                detailsActive
                  ? "border-primary bg-primary text-primary-foreground shadow-primary"
                  : "bg-card text-muted-foreground hover:border-foreground/25 hover:text-foreground",
              )}>
              <SlidersHorizontalIcon aria-hidden className="size-4" />
              Details
              {detailsProgress === "problem" && (
                <span aria-hidden className="size-2 rounded-full bg-streak" />
              )}
              <span className="sr-only">{progressLabels[detailsProgress]}</span>
            </button>
          </li>

          {questions.map((question, index) => {
            const active =
              selection.kind === "question" && selection.key === question.key;
            const progress = getProgress(
              isQuestionComplete(question),
              showErrors,
            );

            return (
              <li key={question.key}>
                <button
                  type="button"
                  aria-current={active ? "true" : undefined}
                  aria-label={`Question ${index + 1}, ${progressLabels[progress].toLowerCase()}`}
                  onClick={() =>
                    onSelect({ kind: "question", key: question.key })
                  }
                  className={cn(
                    "relative inline-flex size-10 shrink-0 items-center justify-center rounded-xl border font-display text-sm font-bold tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    active
                      ? "border-primary bg-primary text-primary-foreground shadow-primary"
                      : "bg-card text-muted-foreground hover:border-foreground/25 hover:text-foreground",
                  )}>
                  {index + 1}
                  {progress === "problem" && (
                    <span
                      aria-hidden
                      className="absolute top-1 right-1 size-2 rounded-full bg-streak"
                    />
                  )}
                </button>
              </li>
            );
          })}

          <li>
            <button
              type="button"
              aria-label="Add question"
              disabled={atMax}
              onClick={onAdd}
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-dashed text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-40">
              <PlusIcon aria-hidden className="size-4" />
            </button>
          </li>
        </ul>
      </nav>

      <aside
        aria-label="Quiz outline"
        className="hidden lg:sticky lg:top-24 lg:block">
        <div className="flex max-h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="p-2">
            <button
              type="button"
              aria-current={detailsActive ? "true" : undefined}
              onClick={() => onSelect({ kind: "details" })}
              className={cn(
                rowClass,
                detailsActive ? "bg-primary-soft" : "hover:bg-muted/60",
              )}>
              <span
                className={cn(
                  numberClass,
                  detailsActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}>
                <SlidersHorizontalIcon aria-hidden className="size-4" />
              </span>
              <span className="min-w-0 flex-1 text-sm font-medium">
                Quiz details
              </span>
              <ProgressIcon progress={detailsProgress} />
            </button>
          </div>

          <div className="flex items-center justify-between border-t px-4 pt-3 pb-2 text-sm font-medium">
            Questions
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground tabular-nums">
              {questions.length}
            </span>
          </div>

          <ol
            ref={listRef}
            className="relative min-h-0 flex-1 space-y-1 overflow-y-auto px-2 pb-2">
            {questions.length === 0 && (
              <li className="px-2.5 py-3 text-sm text-muted-foreground">
                No questions yet.
              </li>
            )}

            {questions.map((question, index) => {
              const active =
                selection.kind === "question" && selection.key === question.key;
              const progress = getProgress(
                isQuestionComplete(question),
                showErrors,
              );
              const title = question.title.trim();

              return (
                <li key={question.key}>
                  <button
                    type="button"
                    aria-current={active ? "true" : undefined}
                    onClick={() =>
                      onSelect({ kind: "question", key: question.key })
                    }
                    className={cn(
                      rowClass,
                      active ? "bg-primary-soft" : "hover:bg-muted/60",
                    )}>
                    <span
                      className={cn(
                        numberClass,
                        active
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                      )}>
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block truncate text-sm font-medium",
                          !title && "text-muted-foreground",
                        )}>
                        {title || "Untitled question"}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {questionTypeLabels[question.type]}
                      </span>
                    </span>
                    <ProgressIcon progress={progress} />
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="space-y-2 border-t p-3">
            {questions.length < limits.questionsMin && (
              <p className="px-1 text-xs text-muted-foreground">
                Add at least {limits.questionsMin} questions to publish.
              </p>
            )}
            <Button
              variant="outline"
              className="w-full"
              disabled={atMax}
              onClick={onAdd}>
              <PlusIcon />
              Add question
            </Button>
          </div>

          <div className="border-t p-3">{footer}</div>

          <p className="flex flex-wrap items-center gap-1.5 border-t px-4 py-3 text-xs text-muted-foreground">
            <Keycap>Alt</Keycap>
            <Keycap>↑</Keycap>
            <Keycap>↓</Keycap>
            switch question
          </p>
        </div>
      </aside>
    </>
  );
}
