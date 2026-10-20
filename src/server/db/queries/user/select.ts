"use server";

import db from "@/server/db";
import { quizAttempts, quizzes, User, users } from "@/server/db/schema";
import { eq, count, desc, sql } from "drizzle-orm";

export const selectUserById = async (userId: number) => {
  return await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
};

export const checkUserExists = async (userId: number): Promise<boolean> => {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { id: true },
  });
  return !!user;
};

export const getUserCurrentStreak = async (userId: number) => {
  return await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      currentStreak: true,
    },
  });
};

export async function selectUserStats(user: User) {
  // Get all user's quiz attempts
  const attemptsStats = await db.query.quizAttempts.findMany({
    where: eq(quizAttempts.userId, user.id),
    columns: {
      percentage: true,
      isCompleted: true,
      timeTaken: true,
    },
  });

  // Get category with most attempts
  const topCategoryResult = await db
    .select({
      category: quizzes.category,
      attemptCount: count(quizAttempts.id),
    })
    .from(quizzes)
    .innerJoin(quizAttempts, eq(quizAttempts.quizId, quizzes.id))
    .where(eq(quizAttempts.userId, user.id))
    .groupBy(quizzes.category)
    .orderBy(desc(sql`count(*)`))
    .limit(1);

  // Calculate statistics
  const totalQuizzesTaken = attemptsStats.length;
  const averageScore =
    attemptsStats.length > 0
      ? Math.round(
          attemptsStats.reduce((sum, attempt) => sum + attempt.percentage, 0) /
            attemptsStats.length,
        )
      : 0;
  const completedQuizzes = attemptsStats.filter(
    (attempt) => attempt.isCompleted,
  ).length;
  const completionRate =
    totalQuizzesTaken > 0
      ? Math.round((completedQuizzes / totalQuizzesTaken) * 100)
      : 0;
  const averageTimePerQuiz =
    attemptsStats.length > 0
      ? Math.round(
          attemptsStats.reduce((sum, attempt) => sum + attempt.timeTaken, 0) /
            attemptsStats.length,
        )
      : 0;

  return {
    totalQuizzesTaken,
    averageScore,
    topCategory: topCategoryResult[0]?.category ?? "None",
    completionRate,
    bestStreak: user.bestStreak,
    averageTimePerQuiz,
    totalXP: user.totalXp,
  };
}
