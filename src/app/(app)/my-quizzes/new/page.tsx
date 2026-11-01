import type { Metadata } from "next";
import { createEmptySettings } from "@/lib/quiz-editor-rules";
import { listCategories } from "@/server/queries/quizzes";
import { requireCreator } from "@/server/session";
import { QuizEditor } from "../_components/quiz-editor/quiz-editor";
import { StatusBadge } from "../_components/quiz-status";

export const metadata: Metadata = { title: "New quiz" };

export default async function NewQuizPage() {
  await requireCreator("/my-quizzes/new");
  const categories = await listCategories();

  return (
    <QuizEditor
      mode="new"
      status="DRAFT"
      statusBadge={<StatusBadge status="DRAFT" />}
      categories={categories.map(({ name, slug }) => ({ name, slug }))}
      initial={{ settings: createEmptySettings(), questions: [] }}
    />
  );
}
