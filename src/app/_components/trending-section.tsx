import Link from "next/link";
import { ClockIcon, ListChecksIcon, StarIcon } from "lucide-react";
import { DifficultyMeter } from "@/components/quiz/difficulty-meter";
import { buttonVariants } from "@/components/ui/button";
import { getCategoryIcon } from "@/lib/category-icons";
import type { QuizCardData } from "@/types/quiz";

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function TrendingCard({ quiz }: { quiz: QuizCardData }) {
  const Icon = getCategoryIcon(quiz.category.slug);
  const authorName = quiz.author?.name ?? "Former member";

  return (
    <Link
      href={`/quizzes/${quiz.slug}`}
      className="group flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground">
          <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-foreground">
            <Icon className="size-4.5" />
          </span>
          {quiz.category.name}
        </span>
        <DifficultyMeter
          difficulty={quiz.difficulty}
          className="text-xs font-medium text-muted-foreground"
        />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-xl">{quiz.title}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {quiz.description}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <ListChecksIcon className="size-4" />
          {quiz.questions} questions
        </span>
        <span className="flex items-center gap-1.5">
          <ClockIcon className="size-4" />
          {quiz.timeLimitMinutes ? `${quiz.timeLimitMinutes} min` : "Untimed"}
        </span>
        {quiz.avgRating !== null ? (
          <span className="flex items-center gap-1.5">
            <StarIcon className="size-4 fill-xp text-xp" />
            {quiz.avgRating.toFixed(1)}
          </span>
        ) : (
          <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary">
            New
          </span>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between border-t pt-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
            {authorName.charAt(0).toUpperCase()}
          </span>
          {authorName}
        </span>
        <span className="tabular-nums">{compact.format(quiz.plays)} plays</span>
      </div>
    </Link>
  );
}

export default function TrendingSection({
  quizzes,
}: {
  quizzes: QuizCardData[];
}) {
  if (quizzes.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-3xl sm:text-4xl">Popular quizzes</h2>
          <p className="max-w-prose text-base text-muted-foreground">
            The quizzes people play the most.
          </p>
        </div>
        <Link
          href="/quizzes"
          className={buttonVariants({ variant: "outline" })}>
          Browse all quizzes
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {quizzes.map((quiz) => (
          <TrendingCard key={quiz.slug} quiz={quiz} />
        ))}
      </div>
    </section>
  );
}
