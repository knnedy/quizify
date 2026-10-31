import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { QuizCard } from "@/components/quiz/quiz-card";
import { requireUser } from "@/server/session";
import { RatingPrompt } from "./_components/rating-prompt";
import { ResultHero } from "./_components/result-hero";
import { ResultStats } from "./_components/result-stats";
import { XpBreakdown } from "./_components/xp-breakdown";
import { getQuizResult } from "./mock-data";

export const metadata: Metadata = { title: "Your results" };

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ResultsPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const [{ slug }, raw] = await Promise.all([params, searchParams]);
  await requireUser(`/quizzes/${slug}/results`);

  const score = Number.parseInt(first(raw.score) ?? "", 10);
  const result = await getQuizResult(slug, {
    score: Number.isFinite(score) ? score : undefined,
    timedOut: first(raw.timeout) === "1",
  });
  if (!result) notFound();

  return (
    <main>
      <ResultHero result={result} />

      <div className="mx-auto max-w-4xl space-y-6 px-6 py-10">
        <ResultStats result={result} />
        <div className="grid gap-6 md:grid-cols-2">
          <XpBreakdown lines={result.xpLines} total={result.xpTotal} />
          <RatingPrompt initial={result.myRating} />
        </div>
      </div>

      {result.related.length > 0 && (
        <section className="border-t bg-muted/30">
          <div className="mx-auto max-w-6xl space-y-6 px-6 py-12">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-2xl">Keep playing</h2>
              <Link
                href={`/quizzes?category=${result.category.slug}`}
                className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                More in {result.category.name}
              </Link>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {result.related.map((quiz) => (
                <QuizCard key={quiz.slug} quiz={quiz} showBookmark />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
