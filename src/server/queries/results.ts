import "server-only";
import {
  and,
  count,
  countDistinct,
  eq,
  inArray,
  max,
  ne,
  sql,
} from "drizzle-orm";
import { difficultyInfo } from "@/lib/difficulty";
import { XP_PER_CORRECT_ANSWER } from "@/lib/xp";
import { db } from "@/server/db";
import {
  attemptAnswers,
  categories,
  quizAttempts,
  quizRatings,
  quizzes,
  users,
  xpEvents,
} from "@/server/db/schema";
import type { QuizResult, XpLine } from "@/types/result";
import { finishedAttempt } from "./attempt-filters";
import { getQuizLeaderboard } from "./leaderboard";
import { listQuizzes } from "./quizzes";
import { reachableByLink } from "./visibility";

export type QuizResultOutcome =
  | { status: "not-found" }
  | { status: "no-attempt" }
  | { status: "ready"; result: QuizResult };

// The player's latest finished attempt on a quiz, with everything the results
// page shows
export async function getQuizResult(
  slug: string,
  userId: number,
): Promise<QuizResultOutcome> {
  const [quiz] = await db
    .select({
      id: quizzes.id,
      slug: quizzes.slug,
      title: quizzes.title,
      difficulty: quizzes.difficulty,
      timeLimitSeconds: quizzes.timeLimitSeconds,
      maxAttempts: quizzes.maxAttempts,
      ownerId: quizzes.userId,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(quizzes)
    .innerJoin(categories, eq(categories.id, quizzes.categoryId))
    .where(and(eq(quizzes.slug, slug), reachableByLink))
    .limit(1);

  if (!quiz) return { status: "not-found" };

  const [attempt] = await db
    .select({
      id: quizAttempts.id,
      status: quizAttempts.status,
      score: quizAttempts.score,
      percentage: quizAttempts.percentage,
      timeTaken: quizAttempts.timeTaken,
      xpEarned: quizAttempts.xpEarned,
    })
    .from(quizAttempts)
    .where(
      and(
        eq(quizAttempts.quizId, quiz.id),
        eq(quizAttempts.userId, userId),
        finishedAttempt,
      ),
    )
    .orderBy(
      sql`${quizAttempts.completedAt} desc nulls last`,
      sql`${quizAttempts.id} desc`,
    )
    .limit(1);

  if (!attempt) return { status: "no-attempt" };

  const [
    answerRows,
    earlierRows,
    playerRows,
    ledger,
    ratingRows,
    userRows,
    leaderboard,
    related,
  ] = await Promise.all([
    db
      .select({
        total: count(),
        answered: sql<number>`(count(*) filter (where cardinality(${attemptAnswers.selectedOptionIds}) > 0))::int`,
      })
      .from(attemptAnswers)
      .where(eq(attemptAnswers.attemptId, attempt.id)),
    db
      .select({ best: max(quizAttempts.score), total: count() })
      .from(quizAttempts)
      .where(
        and(
          eq(quizAttempts.quizId, quiz.id),
          eq(quizAttempts.userId, userId),
          finishedAttempt,
          ne(quizAttempts.id, attempt.id),
        ),
      ),
    db
      .select({ total: countDistinct(quizAttempts.userId) })
      .from(quizAttempts)
      .where(and(eq(quizAttempts.quizId, quiz.id), finishedAttempt)),
    db
      .select({ source: xpEvents.source, amount: xpEvents.amount })
      .from(xpEvents)
      .where(
        and(
          eq(xpEvents.userId, userId),
          eq(xpEvents.sourceId, attempt.id),
          inArray(xpEvents.source, [
            "QUIZ_COMPLETED",
            "PERFECT_SCORE",
            "STREAK_BONUS",
          ]),
        ),
      ),
    db
      .select({ rating: quizRatings.rating })
      .from(quizRatings)
      .where(
        and(eq(quizRatings.quizId, quiz.id), eq(quizRatings.userId, userId)),
      )
      .limit(1),
    db
      .select({ streak: users.currentStreak })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1),
    getQuizLeaderboard(quiz.id, userId),
    listQuizzes({
      category: quiz.categorySlug,
      exclude: quiz.slug,
      sort: "popular",
      pageSize: 3,
      viewerId: userId,
    }),
  ]);

  const total = answerRows[0]?.total ?? 0;
  const answered = answerRows[0]?.answered ?? 0;
  const previousBest = earlierRows[0]?.best ?? null;
  const attemptsUsed = (earlierRows[0]?.total ?? 0) + 1;
  const players = playerRows[0]?.total ?? 0;

  const amountBySource = new Map(
    ledger.map((entry) => [entry.source, entry.amount]),
  );
  const perQuestion =
    XP_PER_CORRECT_ANSWER * difficultyInfo[quiz.difficulty].level;
  const streakDays = userRows[0]?.streak ?? 0;

  const xpLines: XpLine[] = [];

  const base = amountBySource.get("QUIZ_COMPLETED");
  if (base) {
    xpLines.push({
      label: "Correct answers",
      detail: `${attempt.score} × ${perQuestion} XP`,
      amount: base,
    });
  }

  const perfect = amountBySource.get("PERFECT_SCORE");
  if (perfect) xpLines.push({ label: "Perfect score bonus", amount: perfect });

  const streak = amountBySource.get("STREAK_BONUS");
  if (streak) {
    xpLines.push({ label: `${streakDays}-day streak bonus`, amount: streak });
  }

  return {
    status: "ready",
    result: {
      slug: quiz.slug,
      title: quiz.title,
      status: attempt.status === "TIMED_OUT" ? "TIMED_OUT" : "COMPLETED",
      score: attempt.score,
      total,
      answered,
      percentage: attempt.percentage,
      timeSeconds: attempt.timeTaken,
      timeLimitSeconds: quiz.timeLimitSeconds,
      rank: leaderboard.you?.rank ?? players,
      players,
      previousBest,
      isNewBest: previousBest !== null && attempt.score > previousBest,
      canPlayAgain:
        quiz.maxAttempts === null || attemptsUsed < quiz.maxAttempts,
      isOwner: quiz.ownerId === userId,
      xpLines,
      xpTotal: attempt.xpEarned,
      myRating: ratingRows[0]?.rating ?? null,
      category: { name: quiz.categoryName, slug: quiz.categorySlug },
      related: related.items,
    },
  };
}
