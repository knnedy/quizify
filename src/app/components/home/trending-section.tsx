import Link from "next/link";
import { ClockIcon, ListChecksIcon, StarIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { trendingQuizzes, type MockQuiz } from "./mock-data";

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function LevelMeter({ level }: { level: 1 | 2 | 3 }) {
  return (
    <span className="flex items-end gap-0.5" aria-hidden>
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={cn(
            "w-1 rounded-full",
            n === 1 ? "h-2" : n === 2 ? "h-3" : "h-4",
            n <= level ? "bg-foreground" : "bg-border",
          )}
        />
      ))}
    </span>
  );
}

function QuizCard({ quiz }: { quiz: MockQuiz }) {
  const Icon = quiz.icon;

  return (
    <Link
      href={`/quizzes/${quiz.slug}`}
      className="group flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground">
          <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-foreground">
            <Icon className="size-[18px]" />
          </span>
          {quiz.category}
        </span>
        <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <LevelMeter level={quiz.level} />
          {quiz.levelLabel}
        </span>
      </div>

      <div className="space-y-1.5">
        <h3 className="text-xl">{quiz.title}</h3>
        <p className="text-sm text-muted-foreground">{quiz.description}</p>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <ListChecksIcon className="size-4" />
          {quiz.questions} questions
        </span>
        <span className="flex items-center gap-1.5">
          <ClockIcon className="size-4" />
          {quiz.minutes} min
        </span>
        <span className="flex items-center gap-1.5">
          <StarIcon className="size-4 fill-xp text-xp" />
          {quiz.rating.toFixed(1)}
        </span>
      </div>

      <div className="mt-auto flex items-center justify-between border-t pt-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
            {quiz.author[0]}
          </span>
          {quiz.author}
        </span>
        <span className="tabular-nums">{compact.format(quiz.plays)} plays</span>
      </div>
    </Link>
  );
}

export default function TrendingSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-3xl sm:text-4xl">Popular right now</h2>
          <p className="max-w-prose text-base text-muted-foreground">
            Quizzes people are playing this week.
          </p>
        </div>
        <Link
          href="/quizzes"
          className={buttonVariants({ variant: "outline" })}>
          Browse all quizzes
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {trendingQuizzes.map((quiz) => (
          <QuizCard key={quiz.slug} quiz={quiz} />
        ))}
      </div>
    </section>
  );
}
