import Link from "next/link";
import { ClockIcon, ListChecksIcon, StarIcon } from "lucide-react";
import { BookmarkToggle } from "@/components/bookmark-toggle";
import { DifficultyMeter } from "@/components/difficulty-meter";
import { getCategoryIcon } from "@/lib/category-icons";
import type { Difficulty } from "@/lib/difficulty";

export type QuizCardData = {
  slug: string;
  title: string;
  description: string;
  category: { name: string; slug: string };
  difficulty: Difficulty;
  questions: number;
  timeLimitMinutes: number | null;
  avgRating: number | null;
  ratings: number;
  plays: number;
  author: { name: string } | null;
  isBookmarked: boolean;
};

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function QuizCard({
  quiz,
  showBookmark,
}: {
  quiz: QuizCardData;
  showBookmark: boolean;
}) {
  const Icon = getCategoryIcon(quiz.category.slug);
  const authorName = quiz.author?.name ?? "Former member";

  return (
    <article className="group relative flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-xs transition-all focus-within:border-ring hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md">
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2.5 text-sm font-medium text-muted-foreground">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
            <Icon className="size-4.5" />
          </span>
          <span className="truncate">{quiz.category.name}</span>
        </span>
        {showBookmark && (
          <BookmarkToggle initial={quiz.isBookmarked} title={quiz.title} />
        )}
      </div>

      <div className="space-y-1.5">
        <h3 className="text-xl">
          <Link
            href={`/quizzes/${quiz.slug}`}
            className="rounded-sm after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
            {quiz.title}
          </Link>
        </h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {quiz.description}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
        <DifficultyMeter
          difficulty={quiz.difficulty}
          className="text-xs font-medium"
        />
        <span className="flex items-center gap-1.5">
          <ListChecksIcon className="size-4" />
          {quiz.questions} questions
        </span>
        <span className="flex items-center gap-1.5">
          <ClockIcon className="size-4" />
          {quiz.timeLimitMinutes ? `${quiz.timeLimitMinutes} min` : "Untimed"}
        </span>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t pt-4 text-sm text-muted-foreground">
        <span className="flex min-w-0 items-center gap-2">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
            {authorName.charAt(0).toUpperCase()}
          </span>
          <span className="truncate">{authorName}</span>
        </span>
        <span className="flex shrink-0 items-center gap-3 tabular-nums">
          {quiz.avgRating !== null ? (
            <span className="flex items-center gap-1">
              <StarIcon className="size-4 fill-xp text-xp" />
              {quiz.avgRating.toFixed(1)}
            </span>
          ) : (
            <span>New</span>
          )}
          <span>{compact.format(quiz.plays)} plays</span>
        </span>
      </div>
    </article>
  );
}
