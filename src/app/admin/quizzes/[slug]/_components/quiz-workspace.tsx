"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "../../../_components/confirm-dialog";
import { SuspendDialog } from "../../../_components/suspend-dialog";
import {
  applyModeration,
  type AdminQuizPreview,
  type QuizChange,
} from "../mock-data";
import { countMentions } from "../report-mentions";
import { CreatorCard } from "./creator-card";
import { ModerationCard } from "./moderation-card";
import { QuestionExplorer } from "./question-explorer";
import { QuizOverview } from "./quiz-overview";
import { QuizReportsCard } from "./quiz-reports-card";

export function QuizWorkspace({ quiz }: { quiz: AdminQuizPreview }) {
  const [changes, setChanges] = useState<QuizChange[]>([]);
  const [suspending, setSuspending] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const moderation = applyModeration(quiz.moderation, changes);
  const mentions = countMentions(quiz.reports);

  function push(change: QuizChange) {
    setChanges((previous) => [...previous, change]);
  }

  function undo() {
    setChanges((previous) => previous.slice(0, -1));
  }

  // Mock only: the real actions save the change and refresh the page.
  function suspend(message: string) {
    setSuspending(false);
    push({ kind: "SUSPEND", message });
    toast.success(`${quiz.title} was suspended`, {
      action: { label: "Undo", onClick: undo },
    });
  }

  function restore() {
    push({ kind: "RESTORE" });
    toast.success(`${quiz.title} is live again`, {
      action: { label: "Undo", onClick: undo },
    });
  }

  function remove() {
    setDeleting(false);
    push({ kind: "DELETE" });
    toast.success(`${quiz.title} was deleted`, {
      action: { label: "Undo", onClick: undo },
    });
  }

  return (
    <div className="space-y-6">
      <QuizOverview quiz={quiz} status={moderation.status} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <aside className="space-y-5 lg:sticky lg:top-3 lg:col-start-2 lg:row-start-1 lg:max-h-[calc(100dvh-1.5rem)] lg:self-start lg:overflow-y-auto lg:overscroll-contain">
          <ModerationCard
            moderation={moderation}
            canUndo={changes.length > 0}
            onSuspend={() => setSuspending(true)}
            onRestore={restore}
            onDelete={() => setDeleting(true)}
            onUndo={undo}
          />
          <QuizReportsCard reports={quiz.reports} />
          <CreatorCard creator={quiz.creator} />
        </aside>

        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          <QuestionExplorer questions={quiz.questions} mentions={mentions} />
        </div>
      </div>

      <SuspendDialog
        open={suspending}
        onOpenChange={setSuspending}
        title={quiz.title}
        onSuspend={suspend}
      />
      <ConfirmDialog
        open={deleting}
        onOpenChange={setDeleting}
        title={`Delete ${quiz.title}?`}
        description="It is removed for everyone and the creator is told. Players' past results are kept, and you can undo it right after."
        confirmLabel="Delete quiz"
        destructive
        onConfirm={remove}
      />
    </div>
  );
}
