import "server-only";
import { and, asc, count, desc, eq } from "drizzle-orm";
import { isExpired } from "@/lib/attempt-time";
import { maxQuizXp } from "@/lib/xp";
import { db } from "@/server/db";
import {
  categories,
  questions,
  quizAttempts,
  quizBookmarks,
  quizRatings,
  quizReports,
  quizTags,
  quizzes,
  tags,
  users,
} from "@/server/db/schema";
import type { BestResult, QuizDetail } from "@/types/quiz";
import { finishedAttempt } from "./attempt-filters";
import { getQuizLeaderboard } from "./leaderboard";
import { listQuizzes } from "./quizzes";
import { reachableByLink } from "./visibility";

const STAR_LEVELS = [5, 4, 3, 2, 1];

// Small lookup for page metadata
export async function getQuizMeta(slug: string) {
  const [quiz] = await db
    .select({ title: quizzes.title, description: quizzes.description })
    .from(quizzes)
    .where(and(eq(quizzes.slug, slug), reachableByLink))
    .limit(1);

  return quiz ?? null;
}

async function isBookmarked(quizId: number, viewerId: number | undefined) {
  if (viewerId === undefined) return false;

  const [row] = await db
    .select({ quizId: quizBookmarks.quizId })
    .from(quizBookmarks)
    .where(
      and(eq(quizBookmarks.quizId, quizId), eq(quizBookmarks.userId, viewerId)),
    )
    .limit(1);

  return row !== undefined;
}

async function hasReported(quizId: number, viewerId: number | undefined) {
  if (viewerId === undefined) return false;

  const [row] = await db
    .select({ id: quizReports.id })
    .from(quizReports)
    .where(
      and(eq(quizReports.quizId, quizId), eq(quizReports.reporterId, viewerId)),
    )
    .limit(1);

  return row !== undefined;
}

// An attempt the viewer can still pick up: started and not out of time
async function hasLiveAttempt(
  quizId: number,
  viewerId: number | undefined,
  timeLimitSeconds: number | null,
) {
  if (viewerId === undefined) return false;

  const [row] = await db
    .select({ startedAt: quizAttempts.startedAt })
    .from(quizAttempts)
    .where(
      and(
        eq(quizAttempts.quizId, quizId),
        eq(quizAttempts.userId, viewerId),
        eq(quizAttempts.status, "IN_PROGRESS"),
      ),
    )
    .limit(1);

  return row !== undefined && !isExpired(row.startedAt, timeLimitSeconds);
}

// The viewer's finished attempts, best first
async function listViewerAttempts(
  quizId: number,
  viewerId: number | undefined,
) {
  if (viewerId === undefined) return [];

  return db
    .select({
      score: quizAttempts.score,
      percentage: quizAttempts.percentage,
      timeTaken: quizAttempts.timeTaken,
      xpEarned: quizAttempts.xpEarned,
      startedAt: quizAttempts.startedAt,
      completedAt: quizAttempts.completedAt,
    })
    .from(quizAttempts)
    .where(
      and(
        eq(quizAttempts.quizId, quizId),
        eq(quizAttempts.userId, viewerId),
        finishedAttempt,
      ),
    )
    .orderBy(
      desc(quizAttempts.score),
      asc(quizAttempts.timeTaken),
      asc(quizAttempts.completedAt),
    );
}

export async function getQuizDetail(
  slug: string,
  viewerId?: number,
): Promise<QuizDetail | null> {
  const [quiz] = await db
    .select({
      id: quizzes.id,
      slug: quizzes.slug,
      title: quizzes.title,
      description: quizzes.description,
      difficulty: quizzes.difficulty,
      timeLimitSeconds: quizzes.timeLimitSeconds,
      maxAttempts: quizzes.maxAttempts,
      publishedAt: quizzes.publishedAt,
      createdAt: quizzes.createdAt,
      ownerId: quizzes.userId,
      categoryName: categories.name,
      categorySlug: categories.slug,
      authorName: users.name,
    })
    .from(quizzes)
    .innerJoin(categories, eq(categories.id, quizzes.categoryId))
    .leftJoin(users, eq(users.id, quizzes.userId))
    .where(and(eq(quizzes.slug, slug), reachableByLink))
    .limit(1);

  if (!quiz) return null;

  const [
    questionRows,
    playRows,
    tagRows,
    ratingRows,
    bookmarked,
    reported,
    liveAttempt,
    attempts,
    leaderboard,
    related,
  ] = await Promise.all([
    db
      .select({ total: count() })
      .from(questions)
      .where(eq(questions.quizId, quiz.id)),
    db
      .select({ total: count() })
      .from(quizAttempts)
      .where(and(eq(quizAttempts.quizId, quiz.id), finishedAttempt)),
    db
      .select({ name: tags.name })
      .from(quizTags)
      .innerJoin(tags, eq(tags.id, quizTags.tagId))
      .where(eq(quizTags.quizId, quiz.id))
      .orderBy(asc(tags.name)),
    db
      .select({ stars: quizRatings.rating, total: count() })
      .from(quizRatings)
      .where(eq(quizRatings.quizId, quiz.id))
      .groupBy(quizRatings.rating),
    isBookmarked(quiz.id, viewerId),
    hasReported(quiz.id, viewerId),
    hasLiveAttempt(quiz.id, viewerId, quiz.timeLimitSeconds),
    listViewerAttempts(quiz.id, viewerId),
    getQuizLeaderboard(quiz.id, viewerId),
    listQuizzes({
      category: quiz.categorySlug,
      exclude: quiz.slug,
      sort: "popular",
      pageSize: 3,
      viewerId,
    }),
  ]);

  const questionTotal = questionRows[0]?.total ?? 0;

  const countsByStars = new Map(
    ratingRows.map((row) => [row.stars, row.total]),
  );
  const distribution = STAR_LEVELS.map((stars) => ({
    stars,
    count: countsByStars.get(stars) ?? 0,
  }));
  const ratings = distribution.reduce((sum, bucket) => sum + bucket.count, 0);
  const avgRating =
    ratings === 0
      ? null
      : distribution.reduce(
          (sum, bucket) => sum + bucket.stars * bucket.count,
          0,
        ) / ratings;

  const [bestAttempt] = attempts;
  const best: BestResult | null =
    bestAttempt && leaderboard.you
      ? {
          score: bestAttempt.score,
          total: questionTotal,
          percentage: bestAttempt.percentage,
          timeSeconds: bestAttempt.timeTaken,
          rank: leaderboard.you.rank,
          xpEarned: bestAttempt.xpEarned,
          attempts: attempts.length,
          lastPlayedAt: new Date(
            Math.max(
              ...attempts.map((attempt) =>
                (attempt.completedAt ?? attempt.startedAt).getTime(),
              ),
            ),
          ),
        }
      : null;

  return {
    slug: quiz.slug,
    title: quiz.title,
    description: quiz.description,
    category: { name: quiz.categoryName, slug: quiz.categorySlug },
    difficulty: quiz.difficulty,
    questions: questionTotal,
    timeLimitMinutes: quiz.timeLimitSeconds
      ? Math.round(quiz.timeLimitSeconds / 60)
      : null,
    avgRating,
    ratings,
    plays: playRows[0]?.total ?? 0,
    author: quiz.authorName ? { name: quiz.authorName } : null,
    isBookmarked: bookmarked,
    tags: tagRows.map((row) => row.name),
    publishedAt: quiz.publishedAt ?? quiz.createdAt,
    xpReward: maxQuizXp(questionTotal, quiz.difficulty),
    distribution,
    leaderboard: { top: leaderboard.top, pinned: leaderboard.pinned },
    best,
    related: related.items,
    isOwner: viewerId !== undefined && quiz.ownerId === viewerId,
    hasReported: reported,
    maxAttempts: quiz.maxAttempts,
    attemptsUsed: attempts.length,
    hasActiveAttempt: liveAttempt,
  };
}
