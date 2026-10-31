import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getPlaySession } from "@/server/queries/play";
import { getQuizMeta } from "@/server/queries/quiz-details";
import { requireUser } from "@/server/session";
import { QuizPlayer } from "./_components/quiz-player";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const quiz = await getQuizMeta(slug);

  return { title: quiz ? `Play ${quiz.title}` : "Quiz not found" };
}

export default async function PlayPage({ params }: { params: Params }) {
  const { slug } = await params;
  const user = await requireUser(`/quizzes/${slug}`);

  const session = await getPlaySession(slug, user.id);
  if (session.status === "not-found") notFound();

  // Attempts start from the details page, so a bare link lands there
  if (session.status === "no-attempt") redirect(`/quizzes/${slug}`);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-8 sm:py-12">
      <QuizPlayer quiz={session.quiz} />
    </main>
  );
}
