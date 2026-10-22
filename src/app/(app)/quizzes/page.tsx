import type { Metadata } from "next";
import Link from "next/link";
import { SearchXIcon } from "lucide-react";
import { QuizCard } from "@/components/quiz-card";
import { buttonVariants } from "@/components/ui/button";
import { isDifficulty } from "@/lib/difficulty";
import { defaultQuizSort, isQuizSort } from "@/lib/quiz-browse";
import { cn } from "@/lib/utils";
import { getOptionalUser } from "@/server/session";
import { QuizFilters } from "./_components/quiz-filters";
import { QuizPagination } from "./_components/quiz-pagination";
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

  const user = await getOptionalUser();

  const [result, categories] = await Promise.all([
    listQuizzes({
      search: q,
      category,
      difficulty,
      sort,
      page: Number.isFinite(parsedPage) ? parsedPage : 1,
    }),
    listCategories(),
  ]);

  const activeParams: Record<string, string> = {};
  if (q) activeParams.q = q;
  if (category) activeParams.category = category;
  if (difficulty) activeParams.difficulty = difficulty;
  if (sort !== defaultQuizSort) activeParams.sort = sort;

  const start =
    result.total === 0 ? 0 : (result.page - 1) * result.pageSize + 1;
  const end = Math.min(result.page * result.pageSize, result.total);

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-10 sm:py-14">
      <div className="space-y-2">
        <h1 className="text-4xl sm:text-5xl">Browse quizzes</h1>
        <p className="max-w-prose text-base text-muted-foreground">
          Find something worth playing. Search by title, narrow by topic or
          difficulty, and sort by what other players enjoy.
        </p>
      </div>

      {!user && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-primary-soft px-4 py-3 text-sm">
          <p>
            <span className="font-medium">
              You&apos;re browsing as a guest.
            </span>{" "}
            <span className="text-muted-foreground">
              Sign in to play quizzes, save favorites and earn XP.
            </span>
          </p>
          <Link
            href="/sign-in?redirect=/quizzes"
            className={cn(buttonVariants({ size: "sm" }), "shadow-primary")}>
            Sign in
          </Link>
        </div>
      )}

      <QuizFilters categories={categories} />

      <p aria-live="polite" className="text-sm text-muted-foreground">
        {result.total === 0 ? (
          "No quizzes found"
        ) : (
          <>
            Showing{" "}
            <span className="font-medium text-foreground tabular-nums">
              {start}&ndash;{end}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground tabular-nums">
              {result.total}
            </span>{" "}
            quizzes
          </>
        )}
        {q && (
          <>
            {" "}
            for &ldquo;<span className="text-foreground">{q}</span>&rdquo;
          </>
        )}
      </p>

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
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed px-6 py-20 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-muted">
            <SearchXIcon className="size-6 text-muted-foreground" />
          </span>
          <div className="space-y-1">
            <h2 className="text-xl">No quizzes found</h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              Try a different search, or clear your filters to see every quiz.
            </p>
          </div>
          <Link
            href="/quizzes"
            className={buttonVariants({ variant: "outline" })}>
            Clear filters
          </Link>
        </div>
      )}

      <div className="pt-4">
        <QuizPagination
          page={result.page}
          pageCount={result.pageCount}
          params={activeParams}
        />
      </div>
    </main>
  );
}
