import type { Metadata } from "next";
import Link from "next/link";
import { SearchXIcon } from "lucide-react";
import { QuizCard } from "@/components/quiz/quiz-card";
import { buttonVariants } from "@/components/ui/button";
import { isDifficulty } from "@/lib/difficulty";
import { defaultQuizSort, isQuizSort } from "@/lib/quiz-browse";
import { getOptionalUser } from "@/server/session";
import { FeaturedQuiz } from "./_components/featured-quiz";
import { QuizPagination } from "./_components/quiz-pagination";
import { QuizSearch } from "./_components/quiz-search";
import { QuizToolbar } from "./_components/quiz-toolbar";
import { TopicFilter } from "./_components/topic-filter";
import { listCategories, listQuizzes } from "./mock-data";

export const metadata: Metadata = { title: "Browse quizzes" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function QuizzesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const raw = await searchParams;

  const q = first(raw.q)?.trim().slice(0, 80) || undefined;
  const category = first(raw.category) || undefined;
  const rawDifficulty = first(raw.difficulty);
  const difficulty = isDifficulty(rawDifficulty) ? rawDifficulty : undefined;
  const rawSort = first(raw.sort);
  const sort = isQuizSort(rawSort) ? rawSort : defaultQuizSort;
  const parsedPage = Number.parseInt(first(raw.page) ?? "1", 10);
  const requestedPage = Number.isFinite(parsedPage) ? parsedPage : 1;

  const hasFilters = Boolean(q || category || difficulty);

  const user = await getOptionalUser();

  // The spotlight only exists on an unfiltered browse. It is left out of the
  // grid on every page, so page numbers stay consistent.
  const featured = hasFilters
    ? null
    : ((await listQuizzes({ sort: "popular", pageSize: 1 })).items[0] ?? null);

  const [result, categories] = await Promise.all([
    listQuizzes({
      search: q,
      category,
      difficulty,
      sort,
      page: requestedPage,
      exclude: featured?.slug,
    }),
    listCategories(),
  ]);

  const showFeatured = featured !== null && requestedPage <= 1;
  const totalMatches = result.total + (featured ? 1 : 0);
  const totalQuizzes = categories.reduce((sum, item) => sum + item.count, 0);

  const activeParams: Record<string, string> = {};
  if (q) activeParams.q = q;
  if (category) activeParams.category = category;
  if (difficulty) activeParams.difficulty = difficulty;
  if (sort !== defaultQuizSort) activeParams.sort = sort;

  return (
    <main>
      <section className="relative overflow-hidden border-b">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_70%_at_90%_0%,var(--glow),transparent)]"
        />
        <div className="relative mx-auto max-w-6xl space-y-8 px-6 py-12 sm:py-16">
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl">What do you want to play?</h1>
            <p className="max-w-prose text-base text-muted-foreground">
              Search{" "}
              <span className="font-semibold text-foreground tabular-nums">
                {totalQuizzes}
              </span>{" "}
              quizzes, or jump straight into a topic.
            </p>
          </div>

          <div className="max-w-2xl space-y-3">
            <QuizSearch />
            {!user && (
              <p className="text-sm text-muted-foreground">
                Browsing as a guest.{" "}
                <Link
                  href="/sign-in?redirect=/quizzes"
                  className="font-medium text-foreground underline-offset-4 hover:underline">
                  Sign in
                </Link>{" "}
                to play, save favorites and earn XP.
              </p>
            )}
          </div>

          <TopicFilter categories={categories} />
        </div>
      </section>

      <QuizToolbar total={totalMatches} />

      <div className="mx-auto max-w-6xl space-y-10 px-6 py-10">
        {showFeatured && featured && <FeaturedQuiz quiz={featured} />}

        {result.items.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {result.items.map((quiz) => (
              <QuizCard
                key={quiz.slug}
                quiz={quiz}
                showBookmark={Boolean(user)}
              />
            ))}
          </div>
        ) : (
          !showFeatured && (
            <div className="flex flex-col items-center gap-5 rounded-2xl border border-dashed px-6 py-16 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-muted">
                <SearchXIcon className="size-6 text-muted-foreground" />
              </span>
              <div className="space-y-1">
                <h2 className="text-xl">No quizzes found</h2>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Nothing matches that search. Clear your filters, or try one of
                  these topics.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {categories.slice(0, 4).map((item) => (
                  <Link
                    key={item.slug}
                    href={`/quizzes?category=${item.slug}`}
                    className={buttonVariants({
                      variant: "outline",
                      size: "sm",
                    })}>
                    {item.name}
                  </Link>
                ))}
              </div>
              <Link
                href="/quizzes"
                className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                Clear filters
              </Link>
            </div>
          )
        )}

        <QuizPagination
          page={result.page}
          pageCount={result.pageCount}
          params={activeParams}
        />
      </div>
    </main>
  );
}
