"use server";

import db from "@/server/db";
import {
  quizBookmarks,
  quizRatings,
  quizAttempts,
  questions,
  PublicQuizOverview,
} from "@/server/db/schema";
import { avg, eq, inArray, count } from "drizzle-orm";

export async function selectBookmarkedQuizzes(
  userId: number,
): Promise<PublicQuizOverview[]> {
  // Get bookmarks with quiz and user data
  const bookmarks = await db.query.quizBookmarks.findMany({
    where: eq(quizBookmarks.userId, userId),
    with: {
      quiz: {
        columns: {
          id: true,
          userId: true,
          title: true,
          description: true,
          category: true,
          difficulty: true,
          isTimeLimited: true,
          timeLimit: true,
          createdAt: true,
          updatedAt: true,
        },
        with: {
          user: {
            columns: {
              name: true,
              image: true,
            },
          },
        },
      },
    },
    orderBy: (bookmarks) => [bookmarks.createdAt],
  });

  if (bookmarks.length === 0) {
    return [];
  }

  // Get quiz IDs for additional data calculation
  const quizIds = bookmarks.map((b) => b.quiz.id);

  // Get average ratings for all bookmarked quizzes
  const ratingsData = await db
    .select({
      quizId: quizRatings.quizId,
      avgRating: avg(quizRatings.rating),
      ratingsCount: count(quizRatings.id),
    })
    .from(quizRatings)
    .where(inArray(quizRatings.quizId, quizIds))
    .groupBy(quizRatings.quizId);

  // Get question counts for all bookmarked quizzes
  const questionCounts = await db
    .select({
      quizId: questions.quizId,
      questionCount: count(questions.id),
    })
    .from(questions)
    .where(inArray(questions.quizId, quizIds))
    .groupBy(questions.quizId);

  // Get attempt counts for all bookmarked quizzes
  const attemptCounts = await db
    .select({
      quizId: quizAttempts.quizId,
      attemptCount: count(quizAttempts.id),
    })
    .from(quizAttempts)
    .where(inArray(quizAttempts.quizId, quizIds))
    .groupBy(quizAttempts.quizId);

  // Create lookup maps for efficient data access
  const ratingsMap = new Map<
    number,
    { avgRating: number; ratingsCount: number }
  >();
  ratingsData.forEach((rating) => {
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

  // Data transformation logic
  const transformedBookmarks: PublicQuizOverview[] = bookmarks.map(
    (bookmark) => {
      const ratingData = ratingsMap.get(bookmark.quiz.id);
      const questionCount = questionCountMap.get(bookmark.quiz.id) || 0;
      const attemptCount = attemptCountMap.get(bookmark.quiz.id) || 0;

      return {
        id: bookmark.quiz.id,
        createdAt: bookmark.quiz.createdAt,
        updatedAt: bookmark.quiz.updatedAt,
        userId: bookmark.quiz.userId,
        title: bookmark.quiz.title,
        description: bookmark.quiz.description,
        category: bookmark.quiz.category,
        difficulty: bookmark.quiz.difficulty,
        isTimeLimited: bookmark.quiz.isTimeLimited,
        timeLimit: bookmark.quiz.timeLimit,
        questions: questionCount,
        attempts: attemptCount > 0 ? attemptCount : null,
        avgRating: ratingData?.avgRating || null,
        ratings: ratingData?.ratingsCount || null,
        user: {
          name: bookmark.quiz.user.name,
          image: bookmark.quiz.user.image,
        },
        isBookmarked: true, // Since these are bookmarked quizzes, this is always true
      };
    },
  );

  return transformedBookmarks;
}
