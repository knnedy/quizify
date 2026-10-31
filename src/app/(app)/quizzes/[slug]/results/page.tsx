import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { QuizCard } from "@/components/quiz/quiz-card";
import { cn } from "@/lib/utils";
import { getQuizResult } from "@/server/queries/results";
import { requireUser } from "@/server/session";
import { RatingPrompt } from "./_components/rating-prompt";
import { ResultHero } from "./_components/result-hero";
import { ResultStats } from "./_components/result-stats";
import { XpBreakdown } from "./_components/xp-breakdown";

export const metadata: Metadata = { title: "Your results" };

type Params = Promise<{ slug: string }>;

export default async function ResultsPage({ params }: { params: Params }) {
  const { slug } = await params;
  const user = await requireUser(`/quizzes/${slug}/results`);

  const outcome = await getQuizResult(slug, user.id);
  if (outcome.status === "not-found") notFound();

  // Nothing finished yet: the details page is where you start
  if (outcome.status === "no-attempt") redirect(`/quizzes/${slug}`);

  const { result } = outcome;

  return (
    <main>
      <ResultHero result={result} />

      <div className="mx-auto max-w-4xl space-y-6 px-6 py-10">
        <ResultStats result={result} />
        <div className={cn("grid gap-6", !result.isOwner && "md:grid-cols-2")}>
          <XpBreakdown lines={result.xpLines} total={result.xpTotal} />
          {!result.isOwner && (
            <RatingPrompt slug={result.slug} initial={result.myRating} />
          )}
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
