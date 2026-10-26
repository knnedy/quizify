import Link from "next/link";
import { EyeIcon, PencilIcon, ShieldAlertIcon, StarIcon } from "lucide-react";
import { DifficultyMeter } from "@/components/difficulty-meter";
import { buttonVariants } from "@/components/ui/button";
import { getCategoryIcon } from "@/lib/category-icons";
import { formatDate } from "@/lib/format-date";
import type { MyQuiz } from "../mock-data";
import { QuizRowMenu } from "./quiz-row-menu";
import { StatusBadge, VisibilityTag } from "./quiz-status";

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function QuizRow({ quiz }: { quiz: MyQuiz }) {
  const Icon = getCategoryIcon(quiz.category.slug);
  const hasPlays = quiz.status !== "DRAFT";

  return (
    <li className="rounded-2xl border bg-card p-5 shadow-xs">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <span className="hidden size-12 shrink-0 items-center justify-center rounded-xl bg-muted sm:flex">
          <Icon aria-hidden className="size-5" />
        </span>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <h3 className="min-w-0 text-xl leading-tight">
              <Link
                href={`/my-quizzes/${quiz.slug}/edit`}
                className="rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
                {quiz.title}
              </Link>
            </h3>
            <StatusBadge status={quiz.status} />
          </div>

          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground tabular-nums">
            <li>{quiz.category.name}</li>
            <li>
              {quiz.questions === 0
                ? "No questions yet"
                : `${quiz.questions} ${quiz.questions === 1 ? "question" : "questions"}`}
            </li>
            <li>
              <DifficultyMeter difficulty={quiz.difficulty} />
            </li>
            <li>
              <VisibilityTag visibility={quiz.visibility} />
            </li>
            {hasPlays && <li>{compact.format(quiz.plays)} plays</li>}
            {hasPlays && quiz.avgRating !== null && (
              <li className="flex items-center gap-1 font-medium text-foreground">
                <StarIcon className="size-3.5 fill-xp text-xp" />
                {quiz.avgRating.toFixed(1)}
              </li>
            )}
            <li>Updated {formatDate(quiz.updatedAt)}</li>
          </ul>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {quiz.status === "PUBLISHED" && (
            <Link
              href={`/quizzes/${quiz.slug}`}
              className={buttonVariants({ variant: "ghost", size: "sm" })}>
              <EyeIcon />
              View
            </Link>
          )}
          <Link
            href={`/my-quizzes/${quiz.slug}/edit`}
            className={buttonVariants({ variant: "outline", size: "sm" })}>
            <PencilIcon />
            Edit
          </Link>
          <QuizRowMenu quiz={quiz} />
        </div>
      </div>

      {quiz.status === "SUSPENDED" && quiz.suspensionReason && (
        <div className="mt-4 flex gap-3 rounded-xl border border-incorrect/30 bg-incorrect-soft px-4 py-3 text-sm text-incorrect-ink">
          <ShieldAlertIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
          <p>{quiz.suspensionReason}</p>
        </div>
      )}
    </li>
  );
}
