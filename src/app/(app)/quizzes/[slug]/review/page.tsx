import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { RotateCcwIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { getQuizReview } from "@/server/queries/review";
import { requireUser } from "@/server/session";
import type { ReviewCounts } from "@/types/review";
import { StartButton } from "../_components/start-button";
import { ReviewHeader } from "./_components/review-header";
import { ReviewList } from "./_components/review-list";

export const metadata: Metadata = { title: "Review answers" };

type Params = Promise<{ slug: string }>;

export default async function ReviewPage({ params }: { params: Params }) {
  const { slug } = await params;
  const user = await requireUser(`/quizzes/${slug}/review`);

  const outcome = await getQuizReview(slug, user.id);
  if (outcome.status === "not-found") notFound();

  // Nothing finished yet: the details page is where you start
  if (outcome.status === "no-attempt") redirect(`/quizzes/${slug}`);

  const { review } = outcome;

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
          {review.canPlayAgain && (
            <StartButton
              slug={review.slug}
              label="Play again"
              icon={<RotateCcwIcon />}
              className="shadow-primary"
            />
          )}
        </div>
      </div>
    </main>
  );
}
