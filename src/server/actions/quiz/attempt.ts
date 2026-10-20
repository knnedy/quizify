"use server";

import db from "@/server/db";
import { QuizAttempt, users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/server/auth";
import { headers } from "next/headers";
import { calculateXP } from "@/server/utils/xp";
import { updateUserXP } from "../user/xp";
import { updateUserStreak } from "../user/streak";
import { QuizActionError } from "@/server/utils/error";
import { tryCatch } from "@/lib/try-catch";
import { selectQuizWithQuestions } from "@/server/db/queries/quiz/select";
import { insertQuizAttempt } from "@/server/db/queries/attempts/insert";
import {
  selectQuizAttemptsByUserId,
  selectUserQuizAttempt,
  selectUserQuizAttempts,
} from "@/server/db/queries/attempts/select";
import { UserRecentAttempt } from "@/lib/types";

export const submitQuizAttempt = async (
  quizId: number,
  answers: number[],
  timeLeft: number,
  userId?: string,
): Promise<{ success: boolean }> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new QuizActionError(
        "UNAUTHORIZED",
        "No active session found",
        "submitQuizAttempt",
      );
    }

    if (!userId || userId !== session.user.id) {
      throw new QuizActionError(
        "UNAUTHORIZED",
        "User ID mismatch or missing",
        "submitQuizAttempt",
      );
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, parseInt(userId)),
    });

    if (!user) {
      throw new QuizActionError(
        "NOT_FOUND",
        "User not found",
        "submitQuizAttempt",
      );
    }

    const quiz = await selectQuizWithQuestions(quizId);

    if (!quiz) {
      throw new QuizActionError(
        "NOT_FOUND",
        "Quiz not found",
        "submitQuizAttempt",
      );
    }

    const score = quiz.questions.reduce((total, question, index) => {
      if (
        answers[index] !== undefined &&
        answers[index] === question.correctAnswer
      ) {
        return total + 1;
      }
      return total;
    }, 0);

    const correctAnswers = quiz.questions.filter(
      (q, idx) => q.correctAnswer === answers[idx],
    ).length;
    const scorePercentage = (correctAnswers / quiz.questions.length) * 100;
    const timeTaken = quiz.timeLimit ? quiz.timeLimit * 60 - timeLeft : 0;

    const xpEarnedPoints = await calculateXP({
      difficulty: quiz.difficulty,
      scorePercentage,
      timeLimit: quiz.timeLimit || 0,
      timeTaken: timeTaken,
      currentStreak: user.currentStreak,
      questionCount: quiz.questions.length,
    });

    await insertQuizAttempt({
      quizId,
      userId: parseInt(userId),
      answers,
      score,
      percentage: Math.round(scorePercentage),
      isCompleted: answers.length === quiz.questions.length,
      timeTaken: quiz.timeLimit ? quiz.timeLimit * 60 - timeLeft : 0,
      xpEarned: xpEarnedPoints,
    });

    const { error: xpError } = await tryCatch(
      updateUserXP(parseInt(userId), xpEarnedPoints),
    );
    if (xpError) {
      throw new QuizActionError(
        "DATABASE_ERROR",
        xpError.message,
        "submitQuizAttempt",
      );
    }

    const { error: userStreakError } = await tryCatch(
      updateUserStreak(parseInt(userId)),
    );
    if (userStreakError) {
      throw new QuizActionError(
        "DATABASE_ERROR",
        userStreakError.message,
        "submitQuizAttempt",
      );
    }

    // Future: Check and update achievements
    // await checkAndUpdateAchievements(parseInt(userId));

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error in submitQuizAttempt:", error);

    if (error instanceof QuizActionError) {
      throw error;
    }

    throw new QuizActionError(
      "DATABASE_ERROR",
      "Failed to validate quiz submission attempt. Please try again later.",
      "submitQuizAttempt",
    );
  }
};

export const getUserQuizAttempt = async (
  userId?: string,
  quizId?: number,
): Promise<QuizAttempt> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new QuizActionError(
        "UNAUTHORIZED",
        "No active session found",
        "getUserQuizAttempt",
      );
    }

    if (!userId || userId !== session.user.id) {
      throw new QuizActionError(
        "UNAUTHORIZED",
        "User ID mismatch or missing",
        "getUserQuizAttempt",
      );
    }

    if (!quizId) {
      throw new QuizActionError(
        "UNAUTHORIZED",
        "Quiz ID missing",
        "getUserQuizAttempt",
      );
    }

    const attempt = await selectUserQuizAttempt(quizId, parseInt(userId));

    if (!attempt) {
      throw new QuizActionError(
        "NOT_FOUND",
        "Quiz attempt not found",
        "getUserQuizAttempt",
      );
    }

    return attempt;
  } catch (error) {
    console.error("Error in getUserQuizAttempt:", error);
    if (error instanceof QuizActionError) {
      throw error;
    }
    throw new QuizActionError(
      "DATABASE_ERROR",
      "Failed to fetch quiz attempt",
      "getUserQuizAttempt",
    );
  }
};

export const getUserQuizAttempts = async (
  userId?: string,
  quizId?: number,
): Promise<QuizAttempt[]> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new QuizActionError(
        "UNAUTHORIZED",
        "No active session found",
        "getUserQuizAttempts",
      );
    }

    if (!userId || userId !== session.user.id) {
      throw new QuizActionError(
        "UNAUTHORIZED",
        "User ID mismatch or missing",
        "getUserQuizAttempts",
      );
    }

    if (!quizId) {
      throw new QuizActionError(
        "UNAUTHORIZED",
        "Quiz ID missing",
        "getUserQuizAttempts",
      );
    }

    const attempts = await selectUserQuizAttempts(quizId, parseInt(userId));

    return attempts;
  } catch (error) {
    console.error("Error in getUserQuizAttempts:", error);
    if (error instanceof QuizActionError) {
      throw error;
    }
    throw new QuizActionError(
      "DATABASE_ERROR",
      "Failed to fetch quiz attempts",
      "getUserQuizAttempts",
    );
  }
};

export const getRecentQuizAttempts = async (
  userId: string,
  limit: number,
): Promise<UserRecentAttempt[]> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new QuizActionError(
        "UNAUTHORIZED",
        "No active session found",
        "getRecentQuizAttempts",
      );
    }

    if (userId !== session.user.id) {
      throw new QuizActionError(
        "UNAUTHORIZED",
        "User ID mismatch",
        "getRecentQuizAttempts",
      );
    }

    const attempts = await selectQuizAttemptsByUserId(parseInt(userId), limit);

    return attempts;
  } catch (error) {
    console.error("Error in getRecentQuizAttempts:", error);
    if (error instanceof QuizActionError) {
      throw error;
    }
    throw new QuizActionError(
      "DATABASE_ERROR",
      "Failed to fetch recent quiz attempts",
      "getRecentQuizAttempts",
    );
  }
};
