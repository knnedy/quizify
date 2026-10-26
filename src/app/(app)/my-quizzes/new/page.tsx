import type { Metadata } from "next";
import { QuizEditor } from "@/components/quiz-editor/quiz-editor";
import { createEmptySettings } from "@/lib/quiz-editor-rules";
import { requireUser } from "@/server/session";
import { StatusBadge } from "../_components/quiz-status";
import { categoryOptions } from "../editor-mock-data";

export const metadata: Metadata = { title: "New quiz" };

export default async function NewQuizPage() {
  await requireUser("/my-quizzes/new");

  return (
    <QuizEditor
      mode="new"
      status="DRAFT"
      statusBadge={<StatusBadge status="DRAFT" />}
      categories={categoryOptions}
      initial={{ settings: createEmptySettings(), questions: [] }}
    />
  );
}
