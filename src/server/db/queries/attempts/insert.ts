"use server";
import db from "@/server/db";
import { quizAttempts } from "@/server/db/schema";

export const insertQuizAttempt = async (attemptData: {
  quizId: number;
  userId: number;
  answers: number[];
  score: number;
  percentage: number;
  isCompleted: boolean;
  timeTaken: number;
  xpEarned: number;
}) => {
  return await db.insert(quizAttempts).values(attemptData);
};
