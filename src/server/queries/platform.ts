import "server-only";
import { count, countDistinct, eq } from "drizzle-orm";
import { db } from "@/server/db";
import { attemptAnswers, quizAttempts, quizzes } from "@/server/db/schema";
import type { PublicStats } from "@/types/stats";
import { finishedAttempt } from "./attempt-filters";
import { publiclyListed } from "./visibility";

export async function getPublicStats(): Promise<PublicStats> {
  const [quizRows, playerRows, answerRows] = await Promise.all([
    db.select({ total: count() }).from(quizzes).where(publiclyListed),
    db
      .select({ total: countDistinct(quizAttempts.userId) })
      .from(quizAttempts)
      .where(finishedAttempt),
    db
      .select({ total: count() })
      .from(attemptAnswers)
      .innerJoin(quizAttempts, eq(quizAttempts.id, attemptAnswers.attemptId))
      .where(finishedAttempt),
  ]);

  return {
    quizzes: quizRows[0]?.total ?? 0,
    players: playerRows[0]?.total ?? 0,
    questionsAnswered: answerRows[0]?.total ?? 0,
  };
}
