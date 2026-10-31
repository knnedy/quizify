import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { BookmarkToggle } from "@/components/quiz/bookmark-toggle";
import { DifficultyMeter } from "@/components/quiz/difficulty-meter";
import { getCategoryIcon } from "@/lib/category-icons";
import { formatDate } from "@/lib/format-date";
import type { QuizDetail } from "@/types/quiz";
import { ReportDialog } from "./report-dialog";

export function QuizHeader({
  quiz,
  showBookmark,
  canReport,
}: {
  quiz: QuizDetail;
  showBookmark: boolean;
  canReport: boolean;
}) {
  const Icon = getCategoryIcon(quiz.category.slug);
  const authorName = quiz.author?.name ?? "Former member";

  return (
    <section className="relative overflow-hidden border-b">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_70%_at_90%_0%,var(--glow),transparent)]"
      />
      <div className="relative mx-auto max-w-6xl space-y-8 px-6 py-10 sm:py-14">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/quizzes"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeftIcon className="size-4" />
            Browse quizzes
          </Link>

          <div className="flex items-center gap-1">
            {canReport && (
              <ReportDialog
                slug={quiz.slug}
                title={quiz.title}
                alreadyReported={quiz.hasReported}
              />
            )}
            {showBookmark && (
              <BookmarkToggle
                slug={quiz.slug}
                initial={quiz.isBookmarked}
                title={quiz.title}
              />
            )}
          </div>
        </div>

        <div className="max-w-3xl space-y-5">
          <Link
            href={`/quizzes?category=${quiz.category.slug}`}
            className="inline-flex items-center gap-2.5 rounded-full border bg-card py-1 pr-3.5 pl-1 text-sm font-medium shadow-xs transition-colors hover:border-foreground/20">
            <span className="flex size-7 items-center justify-center rounded-full bg-muted">
              <Icon className="size-4" />
            </span>
            {quiz.category.name}
          </Link>

          <h1 className="text-4xl sm:text-5xl">{quiz.title}</h1>

          <p className="max-w-prose text-lg leading-relaxed text-muted-foreground">
            {quiz.description}
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <DifficultyMeter
              difficulty={quiz.difficulty}
              className="font-medium text-foreground"
            />
            <span className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                {authorName.charAt(0).toUpperCase()}
              </span>
              By {authorName}
            </span>
            <span>Published {formatDate(quiz.publishedAt)}</span>
          </div>

          {quiz.tags.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {quiz.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
