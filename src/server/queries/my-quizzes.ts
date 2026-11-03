import "server-only";
import { and, count, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { CREATOR_REQUIRED_QUIZZES, reapplyDate } from "@/lib/creator-rules";
import { canCreateQuizzes } from "@/lib/roles";
import { db } from "@/server/db";
import {
  categories,
  creatorApplications,
  questions,
  quizAttempts,
  quizRatings,
  quizzes,
} from "@/server/db/schema";
import type { SessionUser } from "@/server/session";
import type { CreatorSummary, MyQuiz, MyQuizzesView } from "@/types/my-quizzes";
import { finishedAttempt } from "./attempt-filters";
import { getCompletedQuizCount } from "./progress";

// Shown when a quiz was hidden by reports instead of by a person
const AUTO_HIDE_NOTICE =
  "Several players reported this quiz. It is hidden while an admin reviews it.";

export async function listMyQuizzes(userId: number): Promise<MyQuiz[]> {
  const rows = await db
    .select({
      id: quizzes.id,
      slug: quizzes.slug,
      title: quizzes.title,
      difficulty: quizzes.difficulty,
      status: quizzes.status,
      visibility: quizzes.visibility,
      updatedAt: quizzes.updatedAt,
      suspensionReason: quizzes.suspensionReason,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(quizzes)
    .innerJoin(categories, eq(categories.id, quizzes.categoryId))
    .where(and(eq(quizzes.userId, userId), isNull(quizzes.deletedAt)))
    .orderBy(desc(quizzes.updatedAt), desc(quizzes.id));

  if (rows.length === 0) return [];

  const ids = rows.map((row) => row.id);

  const [questionRows, playRows, ratingRows] = await Promise.all([
    db
      .select({ quizId: questions.quizId, total: count() })
      .from(questions)
      .where(inArray(questions.quizId, ids))
      .groupBy(questions.quizId),
    db
      .select({ quizId: quizAttempts.quizId, total: count() })
      .from(quizAttempts)
      .where(and(inArray(quizAttempts.quizId, ids), finishedAttempt))
      .groupBy(quizAttempts.quizId),
    db
      .select({
        quizId: quizRatings.quizId,
        total: count(),
        average: sql<number>`avg(${quizRatings.rating})::float`,
      })
      .from(quizRatings)
      .where(inArray(quizRatings.quizId, ids))
      .groupBy(quizRatings.quizId),
  ]);

  const questionCounts = new Map(questionRows.map((r) => [r.quizId, r.total]));
  const playCounts = new Map(playRows.map((r) => [r.quizId, r.total]));
  const ratingStats = new Map(ratingRows.map((r) => [r.quizId, r]));

  return rows.map((row) => {
    const rating = ratingStats.get(row.id);

    return {
      slug: row.slug,
      title: row.title,
      category: { name: row.categoryName, slug: row.categorySlug },
      difficulty: row.difficulty,
      status: row.status,
      visibility: row.visibility,
      questions: questionCounts.get(row.id) ?? 0,
      plays: playCounts.get(row.id) ?? 0,
      avgRating: rating?.average ?? null,
      ratings: rating?.total ?? 0,
      updatedAt: row.updatedAt,
      suspensionReason:
        row.status === "SUSPENDED"
          ? (row.suspensionReason ?? AUTO_HIDE_NOTICE)
          : null,
    };
  });
}

function summarize(items: MyQuiz[]): CreatorSummary {
  const published = items.filter((quiz) => quiz.status === "PUBLISHED");
  const ratings = published.reduce((sum, quiz) => sum + quiz.ratings, 0);
  const weighted = published.reduce(
    (sum, quiz) => sum + (quiz.avgRating ?? 0) * quiz.ratings,
    0,
  );

  return {
    totalPlays: items.reduce((sum, quiz) => sum + quiz.plays, 0),
    published: published.length,
    avgRating: ratings > 0 ? weighted / ratings : null,
    ratings,
  };
}

export async function getMyQuizzesView(
  user: Pick<SessionUser, "id" | "role">,
): Promise<MyQuizzesView> {
  if (canCreateQuizzes(user.role)) {
    const items = await listMyQuizzes(user.id);
    return { state: "creator", quizzes: items, summary: summarize(items) };
  }

  const [application] = await db
    .select({
      status: creatorApplications.status,
      createdAt: creatorApplications.createdAt,
      reviewedAt: creatorApplications.reviewedAt,
      rejectionReason: creatorApplications.rejectionReason,
    })
    .from(creatorApplications)
    .where(eq(creatorApplications.userId, user.id))
    .orderBy(desc(creatorApplications.createdAt), desc(creatorApplications.id))
    .limit(1);

  if (application?.status === "PENDING") {
    return {
      state: "pending",
      application: {
        submittedAt: application.createdAt,
        reviewedAt: null,
        rejectionReason: null,
        canReapplyAt: null,
      },
    };
  }

  if (application?.status === "REJECTED") {
    const canReapplyAt = reapplyDate(
      application.reviewedAt ?? application.createdAt,
    );

    return {
      state: "rejected",
      canReapply: canReapplyAt.getTime() <= Date.now(),
      application: {
        submittedAt: application.createdAt,
        reviewedAt: application.reviewedAt,
        rejectionReason: application.rejectionReason,
        canReapplyAt,
      },
    };
  }

  // No application yet, or a creator whose role was removed
  return {
    state: "none",
    completed: await getCompletedQuizCount(user.id),
    required: CREATOR_REQUIRED_QUIZZES,
  };
}
