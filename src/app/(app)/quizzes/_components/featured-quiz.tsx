import Link from "next/link";
import { ClockIcon, FlameIcon, StarIcon } from "lucide-react";
import { DifficultyMeter } from "@/components/difficulty-meter";
import type { QuizCardData } from "@/components/quiz/quiz-card";
import { buttonVariants } from "@/components/ui/button";
import { getCategoryIcon } from "@/lib/category-icons";
import { cn } from "@/lib/utils";

const number = new Intl.NumberFormat("en-US");

export function FeaturedQuiz({ quiz }: { quiz: QuizCardData }) {
  const Icon = getCategoryIcon(quiz.category.slug);
  const authorName = quiz.author?.name ?? "Former member";

  return (
    <article className="group relative overflow-hidden rounded-3xl border bg-card shadow-sm transition-colors focus-within:border-ring hover:border-foreground/20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_100%_0%,var(--glow),transparent)]"
      />

      <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.5fr_1fr] lg:items-center lg:gap-12">
        <div className="space-y-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-streak-soft px-3 py-1 text-sm font-semibold text-streak-ink">
            <FlameIcon className="size-4" />
            Most played
          </span>

          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl">
              <Link
                href={`/quizzes/${quiz.slug}`}
                className="rounded-sm after:absolute after:inset-0 after:rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
                {quiz.title}
              </Link>
            </h2>
            <p className="max-w-prose text-base text-muted-foreground">
              {quiz.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-muted text-foreground">
                <Icon className="size-4" />
              </span>
              {quiz.category.name}
            </span>
            <DifficultyMeter
              difficulty={quiz.difficulty}
              className="font-medium"
            />
            <span className="flex items-center gap-1.5">
              <ClockIcon className="size-4" />
              {quiz.timeLimitMinutes
                ? `${quiz.timeLimitMinutes} min`
                : "Untimed"}
            </span>
            <span>by {authorName}</span>
          </div>

          <span
            className={cn(buttonVariants({ size: "lg" }), "shadow-primary")}>
            View quiz
          </span>
        </div>

        <dl className="grid grid-cols-3 divide-x rounded-2xl border bg-background/60 lg:grid-cols-1 lg:divide-x-0 lg:divide-y">
          <div className="flex flex-col-reverse items-center gap-0.5 px-3 py-4 text-center lg:flex-row lg:items-baseline lg:justify-between lg:px-5 lg:text-left">
            <dt className="text-sm text-muted-foreground">plays</dt>
            <dd className="font-display text-3xl font-bold tabular-nums">
              {number.format(quiz.plays)}
            </dd>
          </div>
          <div className="flex flex-col-reverse items-center gap-0.5 px-3 py-4 text-center lg:flex-row lg:items-baseline lg:justify-between lg:px-5 lg:text-left">
            <dt className="text-sm text-muted-foreground">
              {quiz.avgRating !== null
                ? `${number.format(quiz.ratings)} ratings`
                : "rating"}
            </dt>
            <dd className="flex items-center gap-1.5 font-display text-3xl font-bold tabular-nums">
              {quiz.avgRating !== null ? (
                <>
                  <StarIcon className="size-5 fill-xp text-xp" />
                  {quiz.avgRating.toFixed(1)}
                </>
              ) : (
                "New"
              )}
            </dd>
          </div>
          <div className="flex flex-col-reverse items-center gap-0.5 px-3 py-4 text-center lg:flex-row lg:items-baseline lg:justify-between lg:px-5 lg:text-left">
            <dt className="text-sm text-muted-foreground">questions</dt>
            <dd className="font-display text-3xl font-bold tabular-nums">
              {quiz.questions}
            </dd>
          </div>
        </dl>
      </div>
    </article>
  );
}
