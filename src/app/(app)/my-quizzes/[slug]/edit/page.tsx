import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { QuizEditor } from "@/components/quiz-editor/quiz-editor";
import { requireUser } from "@/server/session";
import { StatusBadge } from "../../_components/quiz-status";
import { categoryOptions, getEditableQuiz } from "../../editor-mock-data";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const quiz = await getEditableQuiz(slug);

  return { title: quiz ? `Edit ${quiz.settings.title}` : "Quiz not found" };
}

export default async function EditQuizPage({ params }: { params: Params }) {
  const { slug } = await params;
  await requireUser(`/my-quizzes/${slug}/edit`);

  const quiz = await getEditableQuiz(slug);
  if (!quiz) notFound();

  return (
    <QuizEditor
      key={quiz.slug}
      mode="edit"
      status={quiz.status}
      statusBadge={<StatusBadge status={quiz.status} />}
      suspensionReason={quiz.suspensionReason}
      categories={categoryOptions}
      initial={{ settings: quiz.settings, questions: quiz.questions }}
    />
  );
}
