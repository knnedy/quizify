import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { QuizCard } from "@/components/quiz-card";
import { getOptionalUser } from "@/server/session";
import { BestResultPanel } from "./_components/best-result";
import { Leaderboard } from "./_components/leaderboard";
import { QuizActions } from "./_components/quiz-actions";
import { QuizHeader } from "./_components/quiz-header";
import { RatingsBreakdown } from "./_components/ratings-breakdown";
import { getQuizDetail, resolveViewer } from "./mock-data";

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
  const quiz = await getQuizDetail(slug, "guest");

  if (!quiz) return { title: "Quiz not found" };
  return { title: quiz.title, description: quiz.description };
}

export default async function QuizDetailsPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const [{ slug }, raw] = await Promise.all([params, searchParams]);
  const user = await getOptionalUser();

  const viewer = resolveViewer(first(raw.as), Boolean(user));
  const signedIn = viewer !== "guest";

  const quiz = await getQuizDetail(slug, viewer);
  if (!quiz) notFound();

  return (
    <main>
      <QuizHeader quiz={quiz} showBookmark={signedIn} />

      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
        <aside className="space-y-5 lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1 lg:self-start">
          <QuizActions quiz={quiz} viewer={viewer} />
          {quiz.best && <BestResultPanel best={quiz.best} slug={quiz.slug} />}
        </aside>

        <div className="space-y-10 lg:col-start-1 lg:row-start-1">
          <Leaderboard
            entries={quiz.leaderboard.top}
            pinned={quiz.leaderboard.pinned}
            total={quiz.questions}
          />
          <RatingsBreakdown
            average={quiz.avgRating}
            count={quiz.ratings}
            distribution={quiz.distribution}
          />
        </div>
      </div>

      {quiz.related.length > 0 && (
        <section className="border-t bg-muted/30">
          <div className="mx-auto max-w-6xl space-y-6 px-6 py-12">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-2xl">More in {quiz.category.name}</h2>
              <Link
                href={`/quizzes?category=${quiz.category.slug}`}
                className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                See all
              </Link>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {quiz.related.map((related) => (
                <QuizCard
                  key={related.slug}
                  quiz={related}
                  showBookmark={signedIn}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
