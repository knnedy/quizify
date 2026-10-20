"use server";

import db from "@/server/db";
import { questions, quizzes } from "@/server/db/schema";
import { QuizFormValues } from "@/lib/quiz-form-schema";
import { eq, and } from "drizzle-orm";

export const updateQuizById = async (
  quiz: QuizFormValues,
  quizId: number,
  userId: number,
): Promise<{ id: number } | null> => {
  const { questions: quizQuestions, ...quizData } = quiz;

  return await db.transaction(async (tx) => {
    // Check if quiz exists and belongs to user
    const existingQuiz = await tx
      .select({ id: quizzes.id })
      .from(quizzes)
      .where(and(eq(quizzes.id, quizId), eq(quizzes.userId, userId)))
      .limit(1);

    if (!existingQuiz || existingQuiz.length === 0) {
      return null;
    }

    // Update quiz data
    const [updatedQuiz] = await tx
      .update(quizzes)
      .set({
        title: quizData.title,
        description: quizData.description,
        category: quizData.category,
        difficulty: quizData.difficulty,
        isTimeLimited: quizData.isTimeLimited,
        timeLimit: quizData.isTimeLimited ? quizData.timeLimit : null,
      })
      .where(eq(quizzes.id, quizId))
      .returning({
        id: quizzes.id,
      });

    if (!updatedQuiz) {
      return null;
    }

    // Delete existing questions
    await tx.delete(questions).where(eq(questions.quizId, quizId));

    // Insert new questions
    await tx.insert(questions).values(
      quizQuestions.map((question) => ({
        quizId: quizId,
        title: question.title,
        choices: question.choices,
        correctAnswer: question.correctAnswer,
      })),
    );

    return updatedQuiz;
  });
};
