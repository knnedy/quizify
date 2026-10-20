"use server";

import db from "@/server/db";
import {
  users,
  quizzes,
  quizRatings,
  quizAttempts,
  questions,
  quizBookmarks,
  PublicQuizOverview,
} from "@/server/db/schema";
import { avg, eq, count, desc, gte, and, inArray } from "drizzle-orm";

export async function selectTopRatedQuizzes(
  userId: number,
  limit: number,
  minRatings: number,
): Promise<PublicQuizOverview[]> {
  // First, get quizzes with their average ratings and rating counts
  // Only include quizzes that have at least minRatings ratings
  const topRatedQuizzesData = await db
    .select({
      quizId: quizRatings.quizId,
      avgRating: avg(quizRatings.rating),
      ratingsCount: count(quizRatings.id),
    })
    .from(quizRatings)
    .groupBy(quizRatings.quizId)
    .having(gte(count(quizRatings.id), minRatings))
    .orderBy(desc(avg(quizRatings.rating)))
    .limit(limit);

  if (topRatedQuizzesData.length === 0) {
    return [];
  }

  const topRatedQuizIds = topRatedQuizzesData.map((q) => q.quizId);

  // Get full quiz details for the top rated quizzes using consistent core API
  const quizzesWithDetails = await db
    .select({
      id: quizzes.id,
      createdAt: quizzes.createdAt,
      updatedAt: quizzes.updatedAt,
      userId: quizzes.userId,
      title: quizzes.title,
      description: quizzes.description,
      category: quizzes.category,
      difficulty: quizzes.difficulty,
      isTimeLimited: quizzes.isTimeLimited,
      timeLimit: quizzes.timeLimit,
      userName: users.name,
      userImage: users.image,
    })
    .from(quizzes)
    .innerJoin(users, eq(quizzes.userId, users.id))
    .where(inArray(quizzes.id, topRatedQuizIds));

  // Get question counts for these quizzes
  const questionCounts = await db
    .select({
      quizId: questions.quizId,
      questionCount: count(questions.id),
    })
    .from(questions)
    .where(inArray(questions.quizId, topRatedQuizIds))
    .groupBy(questions.quizId);

  // Get attempt counts for these quizzes
  const attemptCounts = await db
    .select({
      quizId: quizAttempts.quizId,
      attemptCount: count(quizAttempts.id),
    })
    .from(quizAttempts)
    .where(inArray(quizAttempts.quizId, topRatedQuizIds))
    .groupBy(quizAttempts.quizId);

  // Get bookmark status for the current user (if userId provided)
  let bookmarkedQuizIds: number[] = [];
  if (userId) {
    const bookmarks = await db
      .select({
        quizId: quizBookmarks.quizId,
      })
      .from(quizBookmarks)
      .where(
        and(
          eq(quizBookmarks.userId, userId),
          inArray(quizBookmarks.quizId, topRatedQuizIds),
        ),
      );
    bookmarkedQuizIds = bookmarks.map((b) => b.quizId);
  }

  // Create lookup maps with better null handling
  const ratingsMap = new Map<
    number,
    { avgRating: number; ratingsCount: number }
  >();
  topRatedQuizzesData.forEach((rating) => {
    if (rating.avgRating !== null && rating.avgRating !== undefined) {
      ratingsMap.set(rating.quizId, {
        avgRating: Number(rating.avgRating),
        ratingsCount: rating.ratingsCount,
      });
    }
  });

  const questionCountMap = new Map<number, number>();
  questionCounts.forEach((qc) => {
    questionCountMap.set(qc.quizId, qc.questionCount);
  });

  const attemptCountMap = new Map<number, number>();
  attemptCounts.forEach((ac) => {
    attemptCountMap.set(ac.quizId, ac.attemptCount);
  });

  // Transform data to PublicQuizOverview format
  const publicQuizOverviews: PublicQuizOverview[] = quizzesWithDetails
    .map((quiz) => {
      const ratingData = ratingsMap.get(quiz.id);
      const questionCount = questionCountMap.get(quiz.id) || 0;
      const attemptCount = attemptCountMap.get(quiz.id) || 0;

      return {
        id: quiz.id,
        createdAt: quiz.createdAt,
        updatedAt: quiz.updatedAt,
        userId: quiz.userId,
        title: quiz.title,
        description: quiz.description,
        category: quiz.category,
        difficulty: quiz.difficulty,
        isTimeLimited: quiz.isTimeLimited,
        timeLimit: quiz.timeLimit,
        questions: questionCount,
        attempts: attemptCount > 0 ? attemptCount : null,
        avgRating: ratingData?.avgRating || null,
        ratings: ratingData?.ratingsCount || null,
        user: {
          name: quiz.userName,
          image: quiz.userImage,
        },
        isBookmarked: bookmarkedQuizIds.includes(quiz.id),
      };
    })
    // Sort by average rating descending to maintain the top-rated order
    .sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));

  return publicQuizOverviews;
}

export async function selectTopRatedQuizzesByCategory(
  category: string,
  userId?: number,
  limit: number = 10,
  minRatings: number = 2,
): Promise<PublicQuizOverview[]> {
  // Get quizzes in the specified category with their ratings
  const categoryQuizzesWithRatings = await db
    .select({
      quizId: quizRatings.quizId,
      avgRating: avg(quizRatings.rating),
      ratingsCount: count(quizRatings.id),
    })
    .from(quizRatings)
    .innerJoin(quizzes, eq(quizRatings.quizId, quizzes.id))
    .where(eq(quizzes.category, category))
    .groupBy(quizRatings.quizId)
    .having(gte(count(quizRatings.id), minRatings))
    .orderBy(desc(avg(quizRatings.rating)))
    .limit(limit);

  if (categoryQuizzesWithRatings.length === 0) {
    return [];
  }

  const quizIds = categoryQuizzesWithRatings.map((q) => q.quizId);

  // Get full quiz details
  const quizzesWithDetails = await db.query.quizzes.findMany({
    where: inArray(quizzes.id, quizIds),
    with: {
      user: {
        columns: {
          name: true,
          image: true,
        },
      },
    },
  });

  // Get additional data (questions, attempts, bookmarks) - same as above
  const questionCounts = await db
    .select({
      quizId: questions.quizId,
      questionCount: count(questions.id),
    })
    .from(questions)
    .where(inArray(questions.quizId, quizIds))
    .groupBy(questions.quizId);

  const attemptCounts = await db
    .select({
      quizId: quizAttempts.quizId,
      attemptCount: count(quizAttempts.id),
    })
    .from(quizAttempts)
    .where(inArray(quizAttempts.quizId, quizIds))
    .groupBy(quizAttempts.quizId);

  let bookmarkedQuizIds: number[] = [];
  if (userId) {
    const bookmarks = await db.query.quizBookmarks.findMany({
      where: and(
        eq(quizBookmarks.userId, userId),
        inArray(quizBookmarks.quizId, quizIds),
      ),
      columns: {
        quizId: true,
      },
    });
    bookmarkedQuizIds = bookmarks.map((b) => b.quizId);
  }

  // Create maps and transform data (same logic as main function)
  const ratingsMap = new Map<
    number,
    { avgRating: number; ratingsCount: number }
  >();
  categoryQuizzesWithRatings.forEach((rating) => {
    if (rating.avgRating !== null) {
      ratingsMap.set(rating.quizId, {
        avgRating: Number(rating.avgRating),
        ratingsCount: rating.ratingsCount,
      });
    }
  });

  const questionCountMap = new Map<number, number>();
  questionCounts.forEach((qc) => {
    questionCountMap.set(qc.quizId, qc.questionCount);
  });

  const attemptCountMap = new Map<number, number>();
  attemptCounts.forEach((ac) => {
    attemptCountMap.set(ac.quizId, ac.attemptCount);
  });

  const publicQuizOverviews: PublicQuizOverview[] = quizzesWithDetails
    .map((quiz) => {
      const ratingData = ratingsMap.get(quiz.id);
      const questionCount = questionCountMap.get(quiz.id) || 0;
      const attemptCount = attemptCountMap.get(quiz.id) || 0;

      return {
        id: quiz.id,
        createdAt: quiz.createdAt,
        updatedAt: quiz.updatedAt,
        userId: quiz.userId,
        title: quiz.title,
        description: quiz.description,
        category: quiz.category,
        difficulty: quiz.difficulty,
        isTimeLimited: quiz.isTimeLimited,
        timeLimit: quiz.timeLimit,
        questions: questionCount,
        attempts: attemptCount > 0 ? attemptCount : null,
        avgRating: ratingData?.avgRating || null,
        ratings: ratingData?.ratingsCount || null,
        user: {
          name: quiz.user.name,
          image: quiz.user.image,
        },
        isBookmarked: bookmarkedQuizIds.includes(quiz.id),
      };
    })
    .sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));

  return publicQuizOverviews;
}
