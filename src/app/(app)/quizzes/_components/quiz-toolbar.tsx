"use client";

import { useSearchParams } from "next/navigation";
import { ChevronDownIcon } from "lucide-react";
import { difficulties, difficultyInfo } from "@/lib/difficulty";
import { defaultQuizSort, isQuizSort, quizSorts } from "@/lib/quiz-browse";
import { cn } from "@/lib/utils";
import { useQuizParams } from "../_hooks/use-quiz-params";

export function QuizToolbar({ total }: { total: number }) {
  const searchParams = useSearchParams();
  const { update, isPending } = useQuizParams();

  const q = searchParams.get("q");
  const category = searchParams.get("category");
  const difficulty = searchParams.get("difficulty");
  const rawSort = searchParams.get("sort") ?? undefined;
  const sort = isQuizSort(rawSort) ? rawSort : defaultQuizSort;
  const hasFilters = Boolean(q || category || difficulty);

  const levelOptions = [
    { value: null, label: "Any level" },
    ...difficulties.map((d) => ({ value: d, label: difficultyInfo[d].label })),
  ];

  return (
    <div className="border-b bg-background/80 backdrop-blur-md md:sticky md:top-16 md:z-30">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-3">
        <div
          role="group"
          aria-label="Difficulty"
          className="inline-flex max-w-full gap-1 overflow-x-auto rounded-xl border bg-muted p-1 scrollbar-none [&::-webkit-scrollbar]:hidden">
          {levelOptions.map((option) => {
            const active = (difficulty ?? null) === option.value;
            return (
              <button
                key={option.label}
                type="button"
                aria-pressed={active}
                onClick={() => update({ difficulty: option.value })}
                className={cn(
                  "shrink-0 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  active
                    ? "bg-primary text-primary-foreground shadow-primary"
                    : "text-muted-foreground hover:bg-background/70 hover:text-foreground",
                )}>
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          <p
            aria-live="polite"
            className={cn(
              "text-sm text-muted-foreground transition-opacity",
              isPending && "opacity-50",
            )}>
            <span className="font-semibold text-foreground tabular-nums">
              {total}
            </span>{" "}
            {total === 1 ? "quiz" : "quizzes"}
            {q && (
              <>
                {" "}
                for &ldquo;<span className="text-foreground">{q}</span>&rdquo;
              </>
            )}
          </p>

          {hasFilters && (
            <button
              type="button"
              onClick={() =>
                update({ q: null, category: null, difficulty: null })
              }
              className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-ring">
              Clear filters
            </button>
          )}

          <label className="relative inline-flex items-center">
            <span className="sr-only">Sort by</span>
            <select
              value={sort}
              onChange={(event) =>
                update({
                  sort:
                    event.target.value === defaultQuizSort
                      ? null
                      : event.target.value,
                })
              }
              className="h-9 appearance-none rounded-lg border bg-card pr-8 pl-3 text-sm font-medium shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20">
              {quizSorts.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-2.5 size-4 text-muted-foreground" />
          </label>
        </div>
      </div>
    </div>
  );
}
