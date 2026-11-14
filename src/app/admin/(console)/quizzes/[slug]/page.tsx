import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isStaff } from "@/lib/roles";
import { getAdminQuiz } from "@/server/queries/admin-quizzes";
import { getOptionalUser, requireStaff } from "@/server/session";
import { QuizWorkspace } from "./_components/quiz-workspace";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  // Only staff get to look a quiz up, even for a page title
  const viewer = await getOptionalUser();
  if (!viewer || !isStaff(viewer.role)) return { title: "Not found" };

  const quiz = await getAdminQuiz((await params).slug);
  return { title: quiz ? `Review ${quiz.title}` : "Quiz not found" };
}

export default async function AdminQuizPage({ params }: { params: Params }) {
  const { slug } = await params;
  await requireStaff(`/quizzes/${slug}`);

  const quiz = await getAdminQuiz(slug);
  if (!quiz) notFound();

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-6 sm:py-8 lg:py-9">
      <QuizWorkspace key={quiz.slug} quiz={quiz} />
    </main>
  );
}
