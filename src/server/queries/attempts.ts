import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { quizAttempts } from "@/server/db/schema";
import { finishedAttempt } from "./attempt-filters";

// The player's most recent finished attempt on a quiz. Results and review both
// show this one, so they can never disagree.
export async function getLatestFinishedAttempt(quizId: number, userId: number) {
  const [attempt] = await db
    .select({
      id: quizAttempts.id,
      status: quizAttempts.status,
      score: quizAttempts.score,
      percentage: quizAttempts.percentage,
      timeTaken: quizAttempts.timeTaken,
      xpEarned: quizAttempts.xpEarned,
      shuffleSeed: quizAttempts.shuffleSeed,
    })
    .from(quizAttempts)
    .where(
      and(
        eq(quizAttempts.quizId, quizId),
        eq(quizAttempts.userId, userId),
        finishedAttempt,
      ),
    )
    .orderBy(
      sql`${quizAttempts.completedAt} desc nulls last`,
      sql`${quizAttempts.id} desc`,
    )
    .limit(1);

  return attempt ?? null;
}
