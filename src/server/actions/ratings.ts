"use server";

import "server-only";
import { and, eq } from "drizzle-orm";
import { rateQuizSchema, type RateQuizInput } from "@/lib/schemas/rating";
import { db } from "@/server/db";
import { quizAttempts, quizRatings, quizzes } from "@/server/db/schema";
import { finishedAttempt } from "@/server/queries/attempt-filters";
import { reachableByLink } from "@/server/queries/visibility";
import { getOptionalUser } from "@/server/session";
import type { ActionResult } from "@/types/actions";

export async function rateQuiz(input: RateQuizInput): Promise<ActionResult> {
  const user = await getOptionalUser();
  if (!user) return { ok: false, error: "Sign in to rate quizzes." };

  const parsed = rateQuizSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Pick a rating from 1 to 5." };
  }
  const { slug, rating } = parsed.data;

  try {
    const [quiz] = await db
      .select({ id: quizzes.id, ownerId: quizzes.userId })
      .from(quizzes)
      .where(and(eq(quizzes.slug, slug), reachableByLink))
      .limit(1);

    if (!quiz) return { ok: false, error: "That quiz is not available." };
    if (quiz.ownerId === user.id) {
      return { ok: false, error: "You can't rate your own quiz." };
    }

    const [played] = await db
      .select({ id: quizAttempts.id })
      .from(quizAttempts)
      .where(
        and(
          eq(quizAttempts.quizId, quiz.id),
          eq(quizAttempts.userId, user.id),
          finishedAttempt,
        ),
      )
      .limit(1);

    if (!played) {
      return { ok: false, error: "Finish the quiz before rating it." };
    }

    await db
      .insert(quizRatings)
      .values({ quizId: quiz.id, userId: user.id, rating })
      .onConflictDoUpdate({
        target: [quizRatings.userId, quizRatings.quizId],
        set: { rating, updatedAt: new Date() },
      });

    return { ok: true };
  } catch (error) {
    console.error("rateQuiz failed", error);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}
