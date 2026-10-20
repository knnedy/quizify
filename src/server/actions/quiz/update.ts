"use server";

import { revalidatePath } from "next/cache";
import { QuizFormValues } from "@/lib/quiz-form-schema";
import { auth } from "@/server/auth";
import { headers } from "next/headers";
import { updateUserStreak } from "../user/streak";
import { QuizActionError } from "@/server/utils/error";
import { tryCatch } from "@/lib/try-catch";
import { updateQuizById } from "@/server/database/queries/quiz/update";

export const updateQuiz = async (
  quiz: QuizFormValues,
  quizId: number,
  userId?: string,
): Promise<{ quizId: number }> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new QuizActionError(
        "UNAUTHORIZED",
        "No active session found",
        "updateQuiz",
      );
    }

    if (!userId || userId !== session.user.id) {
      throw new QuizActionError(
        "UNAUTHORIZED",
        "User ID mismatch or missing",
        "updateQuiz",
      );
    }

    const userIdInt = parseInt(userId);

    const updatedQuiz = await updateQuizById(quiz, quizId, userIdInt);

    if (!updatedQuiz) {
      throw new QuizActionError(
        "NOT_FOUND",
        "Quiz not found or you do not have permission to update it",
        "updateQuiz",
      );
    }

    // Update user streak
    const { error: streakError } = await tryCatch(
      updateUserStreak(parseInt(userId)),
    );

    if (streakError) {
      throw new QuizActionError(
        "DATABASE_ERROR",
        streakError.message,
        "createQuiz",
      );
    }

    revalidatePath("/quizzes");
    revalidatePath("/my-quizzes");
    revalidatePath(`/quizzes/${quizId}`);
    revalidatePath(`/quizzes/${quizId}/edit`);

    return {
      quizId: updatedQuiz.id,
    };
  } catch (error) {
    console.error("Error in updateQuiz:", error);

    if (error instanceof QuizActionError) {
      throw error;
    }

    throw new QuizActionError(
      "DATABASE_ERROR",
      "Failed to update quiz. Please try again later.",
      "updateQuiz",
    );
  }
};
