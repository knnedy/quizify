"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  InfoIcon,
  PlusIcon,
  ShieldAlertIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { limits, validateSettings } from "@/lib/quiz-editor-rules";
import { cn } from "@/lib/utils";
import { publishQuiz, saveQuiz } from "@/server/actions/quiz-editor";
import type {
  CategoryOption,
  EditorQuestion,
  EditorSelection,
  QuizSettings,
  QuizStatus,
} from "@/types/quiz-editor";
import { useQuizEditor } from "../../_hooks/use-quiz-editor";
import { EditorActions, type EditorPending } from "./editor-actions";
import { EditorHeader } from "./editor-header";
import { EditorSidebar } from "./editor-sidebar";
import { QuestionEditor } from "./question-editor";
import { SettingsPanel } from "./settings-panel";

function Notice({
  tone,
  children,
}: {
  tone: "info" | "danger";
  children: ReactNode;
}) {
  const Icon = tone === "danger" ? ShieldAlertIcon : InfoIcon;

  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border px-4 py-3 text-sm",
        tone === "danger"
          ? "border-incorrect/30 bg-incorrect-soft text-incorrect-ink"
          : "bg-muted/50 text-muted-foreground",
      )}>
      <Icon aria-hidden className="mt-0.5 size-4 shrink-0" />
      <p>{children}</p>
    </div>
  );
}

function Pager({
  index,
  questions,
  atMax,
  onSelect,
  onAdd,
}: {
  index: number;
  questions: EditorQuestion[];
  atMax: boolean;
  onSelect: (selection: EditorSelection) => void;
  onAdd: () => void;
}) {
  const previous: { label: string; selection: EditorSelection } | null =
    index < 0
      ? null
      : index === 0
        ? { label: "Quiz details", selection: { kind: "details" } }
        : {
            label: `Question ${index}`,
            selection: { kind: "question", key: questions[index - 1].key },
          };

  const upcoming = questions[index + 1];

  return (
    <div className="flex items-center justify-between gap-3">
      {previous ? (
        <Button
          variant="outline"
          size="lg"
          onClick={() => onSelect(previous.selection)}>
          <ArrowLeftIcon />
          {previous.label}
        </Button>
      ) : (
        <span />
      )}

      {upcoming ? (
        <Button
          size="lg"
          className="shadow-primary"
          onClick={() => onSelect({ kind: "question", key: upcoming.key })}>
          Question {index + 2}
          <ArrowRightIcon />
        </Button>
      ) : !atMax ? (
        <Button size="lg" variant="outline" onClick={onAdd}>
          <PlusIcon />
          Add question
        </Button>
      ) : (
        <span />
      )}
    </div>
  );
}

export function QuizEditor({
  mode,
  slug,
  status,
  statusBadge,
  suspensionReason,
  categories,
  initial,
}: {
  mode: "new" | "edit";
  slug?: string;
  status: QuizStatus;
  statusBadge?: ReactNode;
  suspensionReason?: string | null;
  categories: CategoryOption[];
  initial: { settings: QuizSettings; questions: EditorQuestion[] };
}) {
  const router = useRouter();
  const { state, dirty, question, selectedIndex, issues, actions } =
    useQuizEditor(initial);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pending, setPending] = useState<EditorPending>(null);

  const selectionKey =
    state.selection.kind === "question" ? state.selection.key : "details";
  const atMax = state.questions.length >= limits.questionsMax;

  // After moving on from the bottom of a long page, bring the top of the next
  // panel back into view.
  useEffect(() => {
    const panel = panelRef.current;
    if (panel && panel.getBoundingClientRect().top < 0) {
      panel.scrollIntoView({ block: "start" });
    }
  }, [selectionKey]);

  async function persist(kind: "save" | "publish") {
    if (pending) return;

    setPending(kind);
    const revision = state.revision;

    try {
      const run = kind === "publish" ? publishQuiz : saveQuiz;
      const result = await run({
        slug,
        settings: state.settings,
        questions: state.questions,
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      actions.markSaved(revision, result.ids);

      if (kind === "publish") {
        toast.success(
          status === "ARCHIVED" ? "Quiz published again" : "Quiz published",
        );
      } else {
        toast.success(status === "DRAFT" ? "Draft saved" : "Changes saved");
      }

      if (mode === "new") {
        router.replace(`/my-quizzes/${result.slug}/edit`);
      } else if (kind === "publish") {
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setPending(null);
    }
  }

  function save() {
    if (dirty) void persist("save");
  }

  function publish() {
    if (issues.length > 0) {
      actions.revealErrors();

      const target = issues.find((issue) => issue.target)?.target;
      if (target) actions.select(target);

      toast.error(
        issues.length === 1
          ? "1 thing to fix before publishing"
          : `${issues.length} things to fix before publishing`,
      );
      return;
    }

    void persist("publish");
  }

  function renderActions(className: string) {
    return (
      <EditorActions
        status={status}
        dirty={dirty}
        pending={pending}
        onSave={save}
        onPublish={publish}
        className={className}
      />
    );
  }

  return (
    <main>
      <EditorHeader
        mode={mode}
        title={state.settings.title}
        statusBadge={statusBadge}
        dirty={dirty}>
        {renderActions("lg:hidden")}
      </EditorHeader>

      <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        {status === "SUSPENDED" && (
          <Notice tone="danger">
            This quiz is suspended.{" "}
            {suspensionReason ?? "An admin has hidden it."} You can still edit
            it, but an admin has to restore it before it goes live again.
          </Notice>
        )}
        {status === "ARCHIVED" && (
          <Notice tone="info">
            This quiz is archived and hidden from everyone. Publish it again to
            bring it back.
          </Notice>
        )}
        {status === "PUBLISHED" && (
          <Notice tone="info">
            This quiz is live. Saved changes go live straight away, and earlier
            scores from players are kept.
          </Notice>
        )}

        <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start lg:gap-8">
          <EditorSidebar
            settings={state.settings}
            questions={state.questions}
            selection={state.selection}
            showErrors={state.showErrors}
            onSelect={actions.select}
            onAdd={actions.addQuestion}
            footer={renderActions("[&>*]:flex-1")}
          />

          <div ref={panelRef} className="scroll-mt-24 space-y-6">
            {question ? (
              <div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-8">
                <QuestionEditor
                  key={question.key}
                  question={question}
                  index={selectedIndex}
                  total={state.questions.length}
                  showErrors={state.showErrors}
                  actions={actions}
                />
              </div>
            ) : (
              <SettingsPanel
                settings={state.settings}
                errors={
                  state.showErrors ? validateSettings(state.settings) : {}
                }
                categories={categories}
                onChange={actions.updateSettings}
              />
            )}

            <Pager
              index={question ? selectedIndex : -1}
              questions={state.questions}
              atMax={atMax}
              onSelect={actions.select}
              onAdd={actions.addQuestion}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
