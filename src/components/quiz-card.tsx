import type { ReactNode } from "react";
import Link from "next/link";
import { StarIcon } from "lucide-react";
import { BookmarkToggle } from "@/components/bookmark-toggle";
import { DifficultyBars } from "@/components/difficulty-meter";
import { getCategoryIcon } from "@/lib/category-icons";
import { difficultyInfo, type Difficulty } from "@/lib/difficulty";

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

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col-reverse gap-1.5 px-3.5 py-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="flex h-5 items-center font-display text-lg leading-none font-bold tabular-nums">
        {children}
      </dd>
    </div>
  );
}

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
    <article className="group relative isolate flex flex-col gap-5 overflow-hidden rounded-2xl border bg-card p-6 shadow-xs transition-all focus-within:border-ring hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md">
      <Icon
        aria-hidden
        strokeWidth={1.25}
        className="pointer-events-none absolute -top-6 -right-6 -z-10 size-40 rotate-12 text-foreground/[0.04] transition-colors duration-300 group-hover:text-primary/[0.1]"
      />

      <div className="relative flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
            <Icon className="size-5" />
          </span>
          <span className="truncate text-sm font-medium text-muted-foreground">
            {quiz.category.name}
          </span>
        </span>
        {showBookmark && (
          <BookmarkToggle initial={quiz.isBookmarked} title={quiz.title} />
        )}
      </div>

      <div className="flex-1 space-y-2">
        <h3 className="text-2xl leading-tight">
          <Link
            href={`/quizzes/${quiz.slug}`}
            className="rounded-sm after:absolute after:inset-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
            {quiz.title}
          </Link>
        </h3>
        <p className="line-clamp-2 text-[15px] leading-relaxed text-muted-foreground">
          {quiz.description}
        </p>
      </div>

      <dl className="grid grid-cols-3 divide-x rounded-xl border bg-muted/40">
        <Stat label="questions">{quiz.questions}</Stat>
        <Stat label="time limit">
          {quiz.timeLimitMinutes ? `${quiz.timeLimitMinutes} min` : "None"}
        </Stat>
        <Stat label={difficultyInfo[quiz.difficulty].label}>
          <DifficultyBars difficulty={quiz.difficulty} />
        </Stat>
      </dl>

      <div className="flex items-center justify-between gap-3 border-t pt-4 text-sm text-muted-foreground">
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
            {authorName.charAt(0).toUpperCase()}
          </span>
          <span className="truncate">{authorName}</span>
        </span>
        <span className="flex shrink-0 items-center gap-3 tabular-nums">
          {quiz.avgRating !== null ? (
            <span className="flex items-center gap-1 font-medium text-foreground">
              <StarIcon className="size-4 fill-xp text-xp" />
              {quiz.avgRating.toFixed(1)}
              <span className="font-normal text-muted-foreground">
                ({compact.format(quiz.ratings)})
              </span>
            </span>
          ) : (
            <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary">
              New
            </span>
          )}
          <span>{compact.format(quiz.plays)} plays</span>
        </span>
      </div>
    </article>
  );
}
