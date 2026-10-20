"use server";

import { revalidatePath } from "next/cache";
import { QuizFormValues } from "@/lib/quiz-form-schema";
import { auth } from "@/server/auth";
import { headers } from "next/headers";
import { updateUserStreak } from "../user/streak";
import { QuizActionError } from "@/server/utils/error";
import { tryCatch } from "@/lib/try-catch";
import { insertQuizWithQuestions } from "@/server/db/queries/quiz/insert";

export const createQuiz = async (
  quiz: QuizFormValues,
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
        "createQuiz",
      );
    }

    if (!userId || userId !== session.user.id) {
      throw new QuizActionError(
        "UNAUTHORIZED",
        "User ID mismatch or missing",
        "createQuiz",
      );
    }

    const createdQuiz = await insertQuizWithQuestions(quiz, parseInt(userId));

    if (!createdQuiz) {
      throw new QuizActionError(
        "DATABASE_ERROR",
        "Failed to create quiz with questions",
        "createQuiz",
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

    // Revalidate the quizzes page and the new quiz page
    revalidatePath("/quizzes");
    revalidatePath(`/quiz/${createdQuiz.id}`);

    return {
      quizId: createdQuiz.id,
    };
  } catch (error) {
    console.error("Error in createQuiz:", error);
    if (error instanceof QuizActionError) {
      throw error;
    }

    throw new QuizActionError(
      "DATABASE_ERROR",
      "Failed to create quiz. Please try again later.",
      "createQuiz",
    );
  }
};
