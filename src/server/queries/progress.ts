import "server-only";
import { and, countDistinct, eq } from "drizzle-orm";
import { db } from "@/server/db";
import { quizAttempts } from "@/server/db/schema";
import { finishedAttempt } from "./attempt-filters";

// Different quizzes the player has finished at least once
export async function getCompletedQuizCount(userId: number) {
  const [row] = await db
    .select({ total: countDistinct(quizAttempts.quizId) })
    .from(quizAttempts)
    .where(and(eq(quizAttempts.userId, userId), finishedAttempt));

  return row?.total ?? 0;
}
