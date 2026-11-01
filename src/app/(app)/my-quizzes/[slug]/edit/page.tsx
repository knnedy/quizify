import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEditableQuiz } from "@/server/queries/editor";
import { listCategories } from "@/server/queries/quizzes";
import { getOptionalUser, requireCreator } from "@/server/session";
import { QuizEditor } from "../../_components/quiz-editor/quiz-editor";
import { StatusBadge } from "../../_components/quiz-status";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const user = await getOptionalUser();
  const quiz = user ? await getEditableQuiz(slug, user.id) : null;

  return { title: quiz ? `Edit ${quiz.settings.title}` : "Quiz not found" };
}

export default async function EditQuizPage({ params }: { params: Params }) {
  const { slug } = await params;
  const user = await requireCreator(`/my-quizzes/${slug}/edit`);

  const [quiz, categories] = await Promise.all([
    getEditableQuiz(slug, user.id),
    listCategories(),
  ]);
  if (!quiz) notFound();

  return (
    <QuizEditor
      key={quiz.slug}
      mode="edit"
      slug={quiz.slug}
      status={quiz.status}
      statusBadge={<StatusBadge status={quiz.status} />}
      suspensionReason={quiz.suspensionReason}
      categories={categories.map(({ name, slug }) => ({ name, slug }))}
      initial={{ settings: quiz.settings, questions: quiz.questions }}
    />
  );
}
