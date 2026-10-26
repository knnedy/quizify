import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RotateCcwIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/server/session";
import { ReviewHeader } from "./_components/review-header";
import { ReviewList } from "./_components/review-list";
import { getQuizReview, type ReviewCounts } from "./mock-data";

export const metadata: Metadata = { title: "Review answers" };

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const [{ slug }, raw] = await Promise.all([params, searchParams]);
  await requireUser(`/quizzes/${slug}/review`);

  const score = Number.parseInt(first(raw.score) ?? "", 10);
  const review = await getQuizReview(slug, {
    score: Number.isFinite(score) ? score : undefined,
    timedOut: first(raw.timeout) === "1",
  });
  if (!review) notFound();

  const counts: ReviewCounts = { correct: 0, incorrect: 0, skipped: 0 };
  for (const question of review.questions) counts[question.status] += 1;

  return (
    <main>
      <ReviewHeader review={review} counts={counts} />

      <div className="mx-auto max-w-3xl space-y-10 px-6 py-10">
        <ReviewList questions={review.questions} counts={counts} />

        <div className="flex flex-wrap justify-center gap-3 border-t pt-10">
          <Link
            href={`/quizzes/${review.slug}/results`}
            className={buttonVariants({ size: "lg", variant: "outline" })}>
            Back to results
          </Link>
          <Link
            href={`/quizzes/${review.slug}/play`}
            className={buttonVariants({
              size: "lg",
              className: "shadow-primary",
            })}>
            <RotateCcwIcon />
            Play again
          </Link>
        </div>
      </div>
    </main>
  );
}
