"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  deleteAdminQuiz,
  restoreAdminQuiz,
  suspendAdminQuiz,
} from "@/server/actions/admin-quizzes";
import type { ActionResult } from "@/types/actions";
import type { AdminQuizPreview } from "@/types/admin-quizzes";
import { ConfirmDialog } from "../../../_components/confirm-dialog";
import { SuspendDialog } from "../../../_components/suspend-dialog";
import { countMentions } from "../report-mentions";
import { CreatorCard } from "./creator-card";
import { ModerationCard } from "./moderation-card";
import { QuestionExplorer } from "./question-explorer";
import { QuizOverview } from "./quiz-overview";
import { QuizReportsCard } from "./quiz-reports-card";

export function QuizWorkspace({ quiz }: { quiz: AdminQuizPreview }) {
  const [suspending, setSuspending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isPending, startTransition] = useTransition();

  const mentions = countMentions(quiz.reports);

  // The page refreshes on its own after an action, so the moderation card and
  // the status show the new state
  function run(
    task: () => Promise<ActionResult>,
    success: string,
    close?: () => void,
  ) {
    startTransition(async () => {
      const result = await task();

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      close?.();
      toast.success(success);
    });
  }

  function suspend(message: string) {
    run(
      () => suspendAdminQuiz({ quizId: quiz.id, message }),
      `${quiz.title} was suspended`,
      () => setSuspending(false),
    );
  }

  function restore() {
    run(
      () => restoreAdminQuiz({ quizId: quiz.id }),
      `${quiz.title} is live again`,
    );
  }

  function remove() {
    run(
      () => deleteAdminQuiz({ quizId: quiz.id }),
      `${quiz.title} was deleted`,
      () => setDeleting(false),
    );
  }

  return (
    <div className="space-y-6">
      <QuizOverview quiz={quiz} status={quiz.moderation.status} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <aside className="space-y-5 lg:sticky lg:top-3 lg:col-start-2 lg:row-start-1 lg:max-h-[calc(100dvh-1.5rem)] lg:self-start lg:overflow-y-auto lg:overscroll-contain">
          <ModerationCard
            moderation={quiz.moderation}
            busy={isPending}
            onSuspend={() => setSuspending(true)}
            onRestore={restore}
            onDelete={() => setDeleting(true)}
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
        pending={isPending}
        onSuspend={suspend}
      />
      <ConfirmDialog
        open={deleting}
        onOpenChange={setDeleting}
        title={`Delete ${quiz.title}?`}
        description="It is removed for everyone. Players' past results are kept, and this can't be undone from here."
        confirmLabel="Delete quiz"
        destructive
        pending={isPending}
        onConfirm={remove}
      />
    </div>
  );
}
