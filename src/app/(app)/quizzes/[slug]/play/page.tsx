import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/server/session";
import { QuizPlayer } from "./_components/quiz-player";
import { getPlayQuiz } from "./mock-data";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const quiz = await getPlayQuiz(slug);

  return { title: quiz ? `Play ${quiz.title}` : "Quiz not found" };
}

export default async function PlayPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const [{ slug }, raw] = await Promise.all([params, searchParams]);
  await requireUser(`/quizzes/${slug}/play`);

  const seconds = Number.parseInt(first(raw.seconds) ?? "", 10);
  const quiz = await getPlayQuiz(
    slug,
    Number.isFinite(seconds) ? seconds : undefined,
  );
  if (!quiz) notFound();

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-8 sm:py-12">
      <QuizPlayer
        slug={quiz.slug}
        title={quiz.title}
        timeLimitSeconds={quiz.timeLimitSeconds}
        questions={quiz.questions}
      />
    </main>
  );
}
