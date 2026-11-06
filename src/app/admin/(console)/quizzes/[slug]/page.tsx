import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { QuizWorkspace } from "./_components/quiz-workspace";
import { getAdminQuiz } from "./mock-data";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const quiz = await getAdminQuiz((await params).slug);
  return { title: quiz ? `Review ${quiz.title}` : "Quiz not found" };
}

export default async function AdminQuizPage({ params }: { params: Params }) {
  const { slug } = await params;

  const quiz = await getAdminQuiz(slug);
  if (!quiz) notFound();

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-6 sm:py-8 lg:py-9">
      <QuizWorkspace key={quiz.slug} quiz={quiz} />
    </main>
  );
}
