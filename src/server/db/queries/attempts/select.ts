"use server";

import {
  CategoryPerformance,
  UserRecentAttempt,
  WeeklyProgress,
} from "@/lib/types";
import db from "@/server/db";
import { QuizAttempt, quizAttempts } from "@/server/db/schema";
import { eq, desc, and, gte } from "drizzle-orm";

export const selectUserQuizAttempt = async (
  quizId: number,
  userId: number,
): Promise<QuizAttempt | null> => {
  const attempt = await db.query.quizAttempts.findFirst({
    where: and(
      eq(quizAttempts.quizId, quizId),
      eq(quizAttempts.userId, userId),
    ),
    orderBy: desc(quizAttempts.createdAt),
  });

  return attempt || null;
};

export const selectUserQuizAttempts = async (
  quizId: number,
  userId: number,
): Promise<QuizAttempt[]> => {
  const attempts = await db.query.quizAttempts.findMany({
    where: and(
      eq(quizAttempts.quizId, quizId),
      eq(quizAttempts.userId, userId),
    ),
    orderBy: desc(quizAttempts.score),
  });

  return attempts;
};

export async function selectQuizAttemptsByUserId(
  userId: number,
  limit: number,
): Promise<UserRecentAttempt[]> {
  const recentAttempts = await db.query.quizAttempts.findMany({
    where: eq(quizAttempts.userId, userId),
    with: {
      quiz: {
        columns: {
          title: true,
          category: true,
          difficulty: true,
        },
      },
    },
    orderBy: desc(quizAttempts.createdAt),
    limit: limit,
  });

  return recentAttempts.map((attempt) => ({
    id: attempt.id,
    title: attempt.quiz.title,
    category: attempt.quiz.category,
    dateTaken: attempt.createdAt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    percentage: attempt.percentage,
    timeTaken: attempt.timeTaken,
    difficulty: attempt.quiz.difficulty,
  }));
}

export async function selectUserWeeklyProgress(
  userId: number,
): Promise<WeeklyProgress[]> {
  // Get today and 7 days ago (exactly one week)
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);

  // Set time to beginning of day for weekAgo to ensure full 7 days
  weekAgo.setHours(0, 0, 0, 0);

  // Pure database query logic
  const attempts = await db.query.quizAttempts.findMany({
    where: and(
      eq(quizAttempts.userId, userId),
      gte(quizAttempts.createdAt, weekAgo),
    ),
    columns: {
      createdAt: true,
      percentage: true,
      xpEarned: true,
    },
  });

  // Data transformation logic
  // Create an array of the last 7 days in chronological order
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    // Format to YYYY-MM-DD without timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateString = `${year}-${month}-${day}`;

    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

    last7Days.push({
      day: dayName,
      date: dateString,
    });
  }

  // Initialize statistics for each day
  const dailyStats = new Map(
    last7Days.map(({ date }) => [
      date,
      {
        quizzes: 0,
        totalScore: 0,
        totalXp: 0,
      },
    ]),
  );

  // Process attempts with better date formatting
  attempts.forEach((attempt) => {
    const attemptDate = new Date(attempt.createdAt);
    const year = attemptDate.getFullYear();
    const month = String(attemptDate.getMonth() + 1).padStart(2, "0");
    const day = String(attemptDate.getDate()).padStart(2, "0");
    const attemptDateString = `${year}-${month}-${day}`;

    // Only process if the attempt falls within our 7-day window
    if (dailyStats.has(attemptDateString)) {
      const current = dailyStats.get(attemptDateString)!;

      dailyStats.set(attemptDateString, {
        ...current,
        quizzes: current.quizzes + 1,
        totalScore: current.totalScore + attempt.percentage,
        totalXp: current.totalXp + attempt.xpEarned,
      });
    }
  });

  // Convert to array in chronological order with consistent types
  const weeklyProgress: WeeklyProgress[] = last7Days.map(({ date, day }) => {
    const stats = dailyStats.get(date)!;
    return {
      day: day,
      fullDate: date, // YYYY-MM-DD format string
      quizzes: stats.quizzes,
      score:
        stats.quizzes > 0 ? Math.round(stats.totalScore / stats.quizzes) : 0,
      xp: stats.totalXp,
    };
  });

  return weeklyProgress;
}

export async function selectUserCategoryPerformance(
  userId: number,
): Promise<CategoryPerformance[]> {
  const attempts = await db.query.quizAttempts.findMany({
    where: eq(quizAttempts.userId, userId),
    with: {
      quiz: {
        columns: {
          category: true,
        },
      },
    },
    columns: {
      percentage: true,
    },
  });

  // Data transformation logic
  const categoryMap = new Map<string, { totalScore: number; count: number }>();

  attempts.forEach((attempt) => {
    const category = attempt.quiz.category;
    const current = categoryMap.get(category) || { totalScore: 0, count: 0 };
    categoryMap.set(category, {
      totalScore: current.totalScore + attempt.percentage,
      count: current.count + 1,
    });
  });

  const categoryPerformances = Array.from(categoryMap.entries()).map(
    ([name, stats]) => ({
      name,
      score: Math.round(stats.totalScore / stats.count),
      quizzes: stats.count,
    }),
  );

  return categoryPerformances;
}
