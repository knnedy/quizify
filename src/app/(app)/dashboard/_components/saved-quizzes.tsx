import Link from "next/link";
import { BookmarkIcon } from "lucide-react";
import { DifficultyBars } from "@/components/difficulty-meter";
import type { QuizCardData } from "@/components/quiz-card";
import { getCategoryIcon } from "@/lib/category-icons";
import { difficultyInfo } from "@/lib/difficulty";

export function SavedQuizzes({ quizzes }: { quizzes: QuizCardData[] }) {
  return (
    <section
      aria-labelledby="saved-heading"
      className="rounded-2xl border bg-card p-5 shadow-xs sm:p-6">
      <div className="space-y-1">
        <h2 id="saved-heading" className="text-xl">
          Saved for later
        </h2>
        <p className="text-sm text-muted-foreground">Quizzes you bookmarked.</p>
      </div>

      {quizzes.length === 0 ? (
        <div className="mt-5 flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-8 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <BookmarkIcon aria-hidden className="size-5" />
          </span>
          <p className="max-w-xs text-sm text-muted-foreground">
            Tap the bookmark on any quiz to keep it here.
          </p>
        </div>
      ) : (
        <ul className="mt-3 divide-y">
          {quizzes.map((quiz) => {
            const Icon = getCategoryIcon(quiz.category.slug);

            return (
              <li key={quiz.slug}>
                <Link
                  href={`/quizzes/${quiz.slug}`}
                  className="group -mx-2 flex items-center gap-3.5 rounded-xl px-2 py-3 transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-ring">
                  <span
                    aria-hidden
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                    <Icon className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium group-hover:underline">
                      {quiz.title}
                    </span>
                    <span className="block text-xs text-muted-foreground tabular-nums">
                      {quiz.category.name} · {quiz.questions} questions
                    </span>
                  </span>
                  <DifficultyBars difficulty={quiz.difficulty} />
                  <span className="sr-only">
                    {difficultyInfo[quiz.difficulty].label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
