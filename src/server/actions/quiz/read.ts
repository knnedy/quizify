"use server";

import {
  OwnerQuizDetail,
  OwnerQuizOverview,
  PublicQuizDetail,
  PublicQuizOverview,
} from "@/server/db/schema";
import { auth } from "@/server/auth";
import { headers } from "next/headers";
import { QuizActionError } from "@/server/utils/error";
import {
  selectOwnerQuiz,
  selectOwnerQuizzes,
  selectPublicQuiz,
  selectPublicQuizzes,
} from "@/server/db/queries/quiz/select";

export const getOwnerQuizzes = async (
  userId?: string,
): Promise<OwnerQuizOverview[]> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new QuizActionError(
        "UNAUTHORIZED",
        "No active session found",
        "getOwnerQuizzes",
      );
    }

    if (!userId || userId !== session.user.id) {
      throw new QuizActionError(
        "UNAUTHORIZED",
        "User ID mismatch or missing",
        "getOwnerQuizzes",
      );
    }

    const userIdInt = parseInt(userId);

    const ownerQuizzes = await selectOwnerQuizzes(userIdInt);

    return ownerQuizzes;
  } catch (error) {
    console.error("Error in getOwnerQuizzes:", error);
    if (error instanceof QuizActionError) {
      throw error;
    }

    throw new QuizActionError(
      "DATABASE_ERROR",
      "Failed to fetch quizzes",
      "getOwnerQuizzes",
    );
  }
};

export const getPublicQuizzes = async (
  userId?: string,
): Promise<PublicQuizOverview[]> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new QuizActionError(
        "UNAUTHORIZED",
        "No active session found",
        "getPublicQuizzes",
      );
    }

    if (!userId || userId !== session.user.id) {
      throw new QuizActionError(
        "UNAUTHORIZED",
        "User ID mismatch or missing",
        "getPublicQuizzes",
      );
    }

    const userIdNum = parseInt(userId);

    const publicQuizzes = await selectPublicQuizzes(userIdNum);

    return publicQuizzes;
  } catch (error) {
    console.error("Error in getPublicQuizzes:", error);
    if (error instanceof QuizActionError) {
      throw error;
    }
    throw new QuizActionError(
      "DATABASE_ERROR",
      "Failed to fetch quizzes",
      "getPublicQuizzes",
    );
  }
};

export const getOwnerQuiz = async (
  quizId: number,
  userId?: string,
): Promise<OwnerQuizDetail> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new QuizActionError(
        "UNAUTHORIZED",
        "No active session found",
        "getOwnerQuiz",
      );
    }

    if (!userId || userId !== session.user.id) {
      throw new QuizActionError(
        "UNAUTHORIZED",
        "User ID mismatch or missing",
        "getOwnerQuiz",
      );
    }

    if (!quizId || isNaN(quizId)) {
      throw new QuizActionError(
        "VALIDATION_ERROR", // Better error type for invalid input
        "Invalid quiz ID",
        "getOwnerQuiz",
      );
    }

    const userIdInt = parseInt(userId);

    const ownerQuiz = await selectOwnerQuiz(quizId, userIdInt);

    if (!ownerQuiz) {
      throw new QuizActionError("NOT_FOUND", "Quiz not found", "getOwnerQuiz");
    }

    return ownerQuiz;
  } catch (error) {
    console.error("Error in getOwnerQuiz:", error);

    if (error instanceof QuizActionError) {
      throw error;
    }

    throw new QuizActionError(
      "DATABASE_ERROR",
      "Failed to fetch quiz",
      "getOwnerQuiz",
    );
  }
};

export async function getPublicQuiz(
  quizId: number,
  userId?: string,
): Promise<PublicQuizDetail> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new QuizActionError(
        "UNAUTHORIZED",
        "No active session found",
        "getPublicQuiz",
      );
    }

    if (!userId || userId !== session.user.id) {
      throw new QuizActionError(
        "UNAUTHORIZED",
        "User ID mismatch or missing",
        "getPublicQuiz",
      );
    }

    if (!quizId || isNaN(quizId)) {
      throw new QuizActionError(
        "VALIDATION_ERROR",
        "Invalid quiz ID",
        "getPublicQuiz",
      );
    }

    const userIdInt = parseInt(userId);

    const publicQuiz = await selectPublicQuiz(quizId, userIdInt);

    if (!publicQuiz) {
      throw new QuizActionError("NOT_FOUND", "Quiz not found", "getPublicQuiz");
    }

    return publicQuiz;
  } catch (error) {
    console.error("Error in getPublicQuiz:", error);

    if (error instanceof QuizActionError) {
      throw error;
    }

    throw new QuizActionError(
      "DATABASE_ERROR",
      "Failed to fetch quiz",
      "getPublicQuiz",
    );
  }
}
