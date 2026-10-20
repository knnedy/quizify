"use server";

import { auth } from "@/server/auth";
import { headers } from "next/headers";
import { QuizLeaderboard } from "@/server/database/schema";
import { QuizActionError } from "@/server/utils/error";
import { selectQuizLeaderboard } from "@/server/database/queries/quiz/select";

export const getQuizLeaderboard = async (
  quizId: number,
): Promise<QuizLeaderboard> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new QuizActionError(
        "UNAUTHORIZED",
        "No active session found",
        "getQuizLeaderboard",
      );
    }

    if (!quizId) {
      throw new QuizActionError(
        "NOT_FOUND",
        "Quiz ID missing",
        "getQuizLeaderboard",
      );
    }

    const leaderboard = await selectQuizLeaderboard(quizId);

    return leaderboard;
  } catch (error) {
    console.error("Error in getQuizLeaderboard:", error);
    if (error instanceof QuizActionError) {
      throw error;
    }
    throw new QuizActionError(
      "DATABASE_ERROR",
      "Failed to fetch leaderboard",
      "getQuizLeaderboard",
    );
  }
};
