"use server";

import db from "@/server/db";
import {
  quizzes,
  questions,
  quizAttempts,
  quizRatings,
  OwnerQuizOverview,
  OwnerQuizDetail,
  PublicQuizOverview,
  users,
  quizBookmarks,
  PublicQuizDetail,
  QuizLeaderboard,
} from "@/server/db/schema";
import { eq, and, countDistinct, avg, desc } from "drizzle-orm";

export const checkQuizExists = async (quizId: number): Promise<boolean> => {
  const quiz = await db.query.quizzes.findFirst({
    where: eq(quizzes.id, quizId),
    columns: { id: true },
  });
  return !!quiz;
};

export const selectQuizWithQuestions = async (quizId: number) => {
  return await db.query.quizzes.findFirst({
    where: eq(quizzes.id, quizId),
    with: {
      questions: {
        columns: {
          id: true,
          title: true,
          choices: true,
          correctAnswer: true,
        },
      },
    },
  });
};

export const selectOwnerQuizzes = async (
  userId: number,
): Promise<OwnerQuizOverview[]> => {
  const quizzesResults = await db
    .select({
      // Quiz fields
      id: quizzes.id,
      userId: quizzes.userId,
      title: quizzes.title,
      description: quizzes.description,
      category: quizzes.category,
      difficulty: quizzes.difficulty,
      isTimeLimited: quizzes.isTimeLimited,
      timeLimit: quizzes.timeLimit,
      createdAt: quizzes.createdAt,
      updatedAt: quizzes.updatedAt,
      // Aggregated data
      questions: countDistinct(questions.id),
      attempts: countDistinct(quizAttempts.id),
      avgRating: avg(quizRatings.rating),
      ratings: countDistinct(quizRatings.id),
    })
    .from(quizzes)
    .leftJoin(questions, eq(quizzes.id, questions.quizId))
    .leftJoin(quizAttempts, eq(quizzes.id, quizAttempts.quizId))
    .leftJoin(quizRatings, eq(quizzes.id, quizRatings.quizId))
    .where(eq(quizzes.userId, userId))
    .groupBy(quizzes.id)
    .orderBy(desc(quizzes.createdAt));

  // Data transformation logic
  return quizzesResults.map((quiz) => ({
    id: quiz.id,
    userId: quiz.userId,
    title: quiz.title,
    description: quiz.description,
    category: quiz.category,
    difficulty: quiz.difficulty,
    isTimeLimited: quiz.isTimeLimited,
    timeLimit: quiz.timeLimit,
    createdAt: quiz.createdAt,
    updatedAt: quiz.updatedAt,
    // Aggregate data
    questions: quiz.questions,
    avgRating: quiz.avgRating ? Number(quiz.avgRating) : null,
    ratings: quiz.ratings > 0 ? quiz.ratings : null,
    attempts: quiz.attempts > 0 ? quiz.attempts : null,
  }));
};

export const selectOwnerQuiz = async (
  quizId: number,
  userId: number,
): Promise<OwnerQuizDetail | null> => {
  // Single query to get quiz with aggregated data
  const quizResults = await db
    .select({
      // Quiz fields
      id: quizzes.id,
      userId: quizzes.userId,
      title: quizzes.title,
      description: quizzes.description,
      category: quizzes.category,
      difficulty: quizzes.difficulty,
      isTimeLimited: quizzes.isTimeLimited,
      timeLimit: quizzes.timeLimit,
      createdAt: quizzes.createdAt,
      updatedAt: quizzes.updatedAt,
      // Aggregated data
      avgRating: avg(quizRatings.rating),
      ratings: countDistinct(quizRatings.id),
      attempts: countDistinct(quizAttempts.id),
    })
    .from(quizzes)
    .leftJoin(quizRatings, eq(quizzes.id, quizRatings.quizId))
    .leftJoin(quizAttempts, eq(quizzes.id, quizAttempts.quizId))
    .where(and(eq(quizzes.id, quizId), eq(quizzes.userId, userId)))
    .groupBy(quizzes.id)
    .limit(1);

  // Return null if quiz not found or doesn't belong to user
  if (!quizResults || quizResults.length === 0) {
    return null;
  }

  const quiz = quizResults[0];

  // Fetch questions for this quiz
  const questionsResult = await db.query.questions.findMany({
    where: eq(questions.quizId, quizId),
    columns: {
      id: true,
      title: true,
      choices: true,
      correctAnswer: true,
    },
    orderBy: [questions.id],
  });

  // Data transformation logic
  const ownerQuiz: OwnerQuizDetail = {
    id: quiz.id,
    userId: quiz.userId,
    title: quiz.title,
    description: quiz.description,
    category: quiz.category,
    difficulty: quiz.difficulty,
    isTimeLimited: quiz.isTimeLimited,
    timeLimit: quiz.timeLimit,
    createdAt: quiz.createdAt,
    updatedAt: quiz.updatedAt,
    questions: questionsResult.map((q) => ({
      id: q.id,
      title: q.title,
      choices: q.choices,
      correctAnswer: q.correctAnswer,
    })),
    attempts: quiz.attempts > 0 ? quiz.attempts : null,
    avgRating: quiz.avgRating ? Number(quiz.avgRating) : null,
    ratings: quiz.ratings > 0 ? quiz.ratings : null,
  };

  return ownerQuiz;
};

export const selectPublicQuizzes = async (
  userId: number,
): Promise<PublicQuizOverview[]> => {
  const quizResults = await db
    .select({
      // Quiz fields
      id: quizzes.id,
      userId: quizzes.userId,
      title: quizzes.title,
      description: quizzes.description,
      category: quizzes.category,
      difficulty: quizzes.difficulty,
      isTimeLimited: quizzes.isTimeLimited,
      timeLimit: quizzes.timeLimit,
      createdAt: quizzes.createdAt,
      updatedAt: quizzes.updatedAt,
      // User fields
      userName: users.name,
      userImage: users.image,
      // Aggregated data
      questions: countDistinct(questions.id),
      avgRating: avg(quizRatings.rating),
      ratings: countDistinct(quizRatings.id),
      attempts: countDistinct(quizAttempts.id),
    })
    .from(quizzes)
    .innerJoin(users, eq(quizzes.userId, users.id))
    .leftJoin(questions, eq(quizzes.id, questions.quizId))
    .leftJoin(quizAttempts, eq(quizzes.id, quizAttempts.quizId))
    .leftJoin(quizRatings, eq(quizzes.id, quizRatings.quizId))
    .groupBy(quizzes.id, users.id)
    .orderBy(desc(quizzes.createdAt));

  // Batch fetch user bookmarks
  const userBookmarks = await db.query.quizBookmarks.findMany({
    where: eq(quizBookmarks.userId, userId),
    columns: {
      quizId: true,
    },
  });

  const bookmarkedQuizIds = new Set(
    userBookmarks.map((bookmark) => bookmark.quizId),
  );

  // Combine all results
  const publicQuizzes: PublicQuizOverview[] = quizResults.map((quiz) => ({
    id: quiz.id,
    userId: quiz.userId,
    title: quiz.title,
    description: quiz.description,
    category: quiz.category,
    difficulty: quiz.difficulty,
    isTimeLimited: quiz.isTimeLimited,
    timeLimit: quiz.timeLimit,
    createdAt: quiz.createdAt,
    updatedAt: quiz.updatedAt,
    user: {
      name: quiz.userName,
      image: quiz.userImage,
    },
    // Aggregated data
    isBookmarked: bookmarkedQuizIds.has(quiz.id),
    questions: quiz.questions,
    attempts: quiz.attempts > 0 ? quiz.attempts : null,
    avgRating: quiz.avgRating ? Number(quiz.avgRating) : null,
    ratings: quiz.ratings > 0 ? quiz.ratings : null,
  }));

  return publicQuizzes;
};

export const selectPublicQuiz = async (
  quizId: number,
  userId: number,
): Promise<PublicQuizDetail | null> => {
  const quizResults = await db
    .select({
      // Quiz fields
      id: quizzes.id,
      userId: quizzes.userId,
      title: quizzes.title,
      description: quizzes.description,
      category: quizzes.category,
      difficulty: quizzes.difficulty,
      isTimeLimited: quizzes.isTimeLimited,
      timeLimit: quizzes.timeLimit,
      createdAt: quizzes.createdAt,
      updatedAt: quizzes.updatedAt,
      // User fields
      userName: users.name,
      userImage: users.image,
      // Aggregated data
      attempts: countDistinct(quizAttempts.id),
      avgRating: avg(quizRatings.rating),
      ratings: countDistinct(quizRatings.id),
      // Bookmark check
      isBookmarked: countDistinct(quizBookmarks.id),
    })
    .from(quizzes)
    .innerJoin(users, eq(quizzes.userId, users.id))
    .leftJoin(quizRatings, eq(quizzes.id, quizRatings.quizId))
    .leftJoin(quizAttempts, eq(quizzes.id, quizAttempts.quizId))
    .leftJoin(
      quizBookmarks,
      and(eq(quizBookmarks.quizId, quizId), eq(quizBookmarks.userId, userId)),
    )
    .where(eq(quizzes.id, quizId))
    .groupBy(quizzes.id, users.id)
    .limit(1);

  const quiz = quizResults[0];

  // Fetch questions separately (public version - no correct answers)
  const questionsResult = await db.query.questions.findMany({
    where: eq(questions.quizId, quizId),
    columns: {
      id: true,
      title: true,
      choices: true,
    },
    orderBy: [questions.id], // Ensure consistent ordering
  });

  // Construct the PublicQuiz object
  const publicQuiz: PublicQuizDetail = {
    id: quiz.id,
    userId: quiz.userId,
    title: quiz.title,
    description: quiz.description,
    category: quiz.category,
    difficulty: quiz.difficulty,
    isTimeLimited: quiz.isTimeLimited,
    timeLimit: quiz.timeLimit,
    createdAt: quiz.createdAt,
    updatedAt: quiz.updatedAt,
    questions: questionsResult.map((q) => ({
      id: q.id,
      title: q.title,
      choices: q.choices,
    })),
    user: {
      name: quiz.userName,
      image: quiz.userImage,
    },
    isBookmarked: quiz.isBookmarked > 0,
    avgRating: quiz.avgRating ? Number(quiz.avgRating) : null,
    ratings: quiz.ratings > 0 ? quiz.ratings : null,
    attempts: quiz.attempts > 0 ? quiz.attempts : null,
  };

  return publicQuiz;
};

export const selectQuizLeaderboard = async (
  quizId: number,
): Promise<QuizLeaderboard> => {
  const leaderboardData = await db.query.quizAttempts.findMany({
    where: eq(quizAttempts.quizId, quizId),
    orderBy: desc(quizAttempts.score),
    limit: 5,
    with: {
      user: {
        columns: {
          name: true,
          image: true,
        },
      },
    },
  });

  const leaderboard = leaderboardData.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));

  return leaderboard;
};
