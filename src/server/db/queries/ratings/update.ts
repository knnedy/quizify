"use server";

import db from "@/server/db";
import { quizRatings } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";

export const upsertQuizRating = async (
  quizId: number,
  userId: number,
  rating: number,
) => {
  const existingRating = await db.query.quizRatings.findFirst({
    where: and(eq(quizRatings.userId, userId), eq(quizRatings.quizId, quizId)),
  });

  if (existingRating) {
    await db
      .update(quizRatings)
      .set({
        rating: rating,
        updatedAt: new Date(),
      })
      .where(
        and(eq(quizRatings.userId, userId), eq(quizRatings.quizId, quizId)),
      );
    return { isUpdate: true };
  } else {
    await db.insert(quizRatings).values({
      userId: userId,
      quizId: quizId,
      rating: rating,
    });
  }
};
