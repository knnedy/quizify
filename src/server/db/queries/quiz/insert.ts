"use server";

import db from "@/server/db";
import { questions, quizzes } from "@/server/db/schema";
import { QuizFormValues } from "@/lib/quiz-form-schema";

export const insertQuizWithQuestions = async (
  quiz: QuizFormValues,
  userId: number,
): Promise<{ id: number } | null> => {
  const { questions: quizQuestions, ...quizData } = quiz;

  const result = await db.transaction(async (tx) => {
    // Insert quiz
    const [createdQuiz] = await tx
      .insert(quizzes)
      .values({
        userId: userId,
        title: quizData.title,
        description: quizData.description,
        category: quizData.category,
        difficulty: quizData.difficulty,
        isTimeLimited: quizData.isTimeLimited,
        timeLimit: quizData.isTimeLimited ? quizData.timeLimit : 0,
      })
      .returning({
        id: quizzes.id,
      });

    if (!createdQuiz) {
      return null;
    }

    // Insert questions
    await tx.insert(questions).values(
      quizQuestions.map((question) => ({
        quizId: createdQuiz.id,
        title: question.title,
        choices: question.choices,
        correctAnswer: question.correctAnswer,
      })),
    );

    return createdQuiz;
  });

  return result;
};
