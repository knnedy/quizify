import "server-only";
import {
  and,
  count,
  countDistinct,
  desc,
  eq,
  gte,
  inArray,
  isNull,
  ne,
  sql,
} from "drizzle-orm";
import { limits } from "@/lib/quiz-editor-rules";
import { lastDays } from "@/lib/streak";
import { db } from "@/server/db";
import {
  attemptAnswers,
  quizAttempts,
  quizRatings,
  quizzes,
  users,
} from "@/server/db/schema";
import type {
  CreatorActivity,
  CreatorOverview,
  CreatorQuiz,
  DraftQuiz,
} from "@/types/dashboard";
import { finishedAttempt } from "./attempt-filters";
import { listMyQuizzes } from "./my-quizzes";

const DAY = 86_400_000;
const CHART_DAYS = 14;
const WINDOW_DAYS = 30;

// Quizzes the creator still owns, whatever their status
function onMyQuizzes(userId: number) {
  return and(eq(quizzes.userId, userId), isNull(quizzes.deletedAt));
}

function draftNote(questionCount: number) {
  if (questionCount === 0) return "No questions yet";
  if (questionCount < limits.questionsMin) {
    return `Needs at least ${limits.questionsMin} questions to publish`;
  }
  return "Open it to review and publish";
}

// What other players did on the creator's quizzes lately
async function loadActivity(
  userId: number,
  now: Date,
): Promise<CreatorActivity[]> {
  const [plays, ratings] = await Promise.all([
    db
      .select({
        attemptId: quizAttempts.id,
        actor: users.name,
        title: quizzes.title,
        slug: quizzes.slug,
        score: quizAttempts.score,
        at: quizAttempts.completedAt,
      })
      .from(quizAttempts)
      .innerJoin(quizzes, eq(quizzes.id, quizAttempts.quizId))
      .innerJoin(users, eq(users.id, quizAttempts.userId))
      .where(
        and(
          onMyQuizzes(userId),
          finishedAttempt,
          ne(quizAttempts.userId, userId),
        ),
      )
      .orderBy(sql`${quizAttempts.completedAt} desc nulls last`)
      .limit(8),
    db
      .select({
        actor: users.name,
        title: quizzes.title,
        slug: quizzes.slug,
        rating: quizRatings.rating,
        at: quizRatings.updatedAt,
      })
      .from(quizRatings)
      .innerJoin(quizzes, eq(quizzes.id, quizRatings.quizId))
      .innerJoin(users, eq(users.id, quizRatings.userId))
      .where(and(onMyQuizzes(userId), ne(quizRatings.userId, userId)))
      .orderBy(desc(quizRatings.updatedAt))
      .limit(8),
  ]);

  const totals =
    plays.length === 0
      ? []
      : await db
          .select({ attemptId: attemptAnswers.attemptId, total: count() })
          .from(attemptAnswers)
          .where(
            inArray(
              attemptAnswers.attemptId,
              plays.map((row) => row.attemptId),
            ),
          )
          .groupBy(attemptAnswers.attemptId);

  const totalByAttempt = new Map(
    totals.map((row) => [row.attemptId, row.total]),
  );

  const entries = [
    ...plays.map((row) => ({
      kind: "play" as const,
      actor: row.actor,
      text: `scored ${row.score}/${totalByAttempt.get(row.attemptId) ?? 0} on ${row.title}`,
      slug: row.slug,
      at: row.at ?? now,
    })),
    ...ratings.map((row) => ({
      kind: "rating" as const,
      actor: row.actor,
      text: `gave ${row.title} ${row.rating} ${row.rating === 1 ? "star" : "stars"}`,
      slug: row.slug,
      at: row.at,
    })),
  ];

  return entries
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 6)
    .map((entry, index) => ({
      id: index + 1,
      kind: entry.kind,
      actor: entry.actor,
      text: entry.text,
      slug: entry.slug,
      minutesAgo: Math.max(
        0,
        Math.round((now.getTime() - entry.at.getTime()) / 60_000),
      ),
    }));
}

export async function getCreatorOverview(
  userId: number,
  timeZone: string,
  now: Date,
): Promise<CreatorOverview> {
  const since30 = new Date(now.getTime() - WINDOW_DAYS * DAY);
  // A little wider than two 30 day windows, so time zones can't cut it short
  const since62 = new Date(now.getTime() - 62 * DAY);

  // The day a play happened, in the creator's own time zone
  const localDay = sql<string>`to_char((${quizAttempts.completedAt} at time zone 'UTC') at time zone ${timeZone}, 'YYYY-MM-DD')`;

  const [items, perQuiz, byDay, playerRows, activity] = await Promise.all([
    listMyQuizzes(userId),
    db
      .select({
        slug: quizzes.slug,
        started: sql<number>`count(*)::int`,
        completed: sql<number>`(count(*) filter (where ${quizAttempts.status} = 'COMPLETED'))::int`,
        plays30: sql<number>`(count(*) filter (where ${finishedAttempt} and ${gte(quizAttempts.completedAt, since30)}))::int`,
      })
      .from(quizAttempts)
      .innerJoin(quizzes, eq(quizzes.id, quizAttempts.quizId))
      .where(onMyQuizzes(userId))
      .groupBy(quizzes.slug),
    db
      .select({
        day: localDay.as("day"),
        plays: sql<number>`count(*)::int`,
      })
      .from(quizAttempts)
      .innerJoin(quizzes, eq(quizzes.id, quizAttempts.quizId))
      .where(
        and(
          onMyQuizzes(userId),
          finishedAttempt,
          gte(quizAttempts.completedAt, since62),
        ),
      )
      .groupBy(sql`"day"`),
    db
      .select({ total: countDistinct(quizAttempts.userId) })
      .from(quizAttempts)
      .innerJoin(quizzes, eq(quizzes.id, quizAttempts.quizId))
      .where(
        and(
          onMyQuizzes(userId),
          finishedAttempt,
          ne(quizAttempts.userId, userId),
          gte(quizAttempts.completedAt, since30),
        ),
      ),
    loadActivity(userId, now),
  ]);

  // Plays in the last 30 days against the 30 days before them
  const playsByDay = new Map(byDay.map((row) => [row.day, row.plays]));
  const days = lastDays(now, timeZone, WINDOW_DAYS * 2);
  const sum = (keys: string[]) =>
    keys.reduce((total, key) => total + (playsByDay.get(key) ?? 0), 0);

  const plays30 = sum(days.slice(WINDOW_DAYS));
  const previous30 = sum(days.slice(0, WINDOW_DAYS));

  const series = days.slice(-CHART_DAYS).map((key) => ({
    date: `${key}T00:00:00.000Z`,
    plays: playsByDay.get(key) ?? 0,
  }));

  const stats = new Map(perQuiz.map((row) => [row.slug, row]));
  const published = items
    .filter((quiz) => quiz.status === "PUBLISHED")
    .sort((a, b) => b.plays - a.plays);

  const quizRows = published.map((quiz): CreatorQuiz => {
    const row = stats.get(quiz.slug);

    return {
      slug: quiz.slug,
      title: quiz.title,
      category: quiz.category,
      plays: quiz.plays,
      plays30: row?.plays30 ?? 0,
      avgRating: quiz.avgRating,
      ratings: quiz.ratings,
      finishRate:
        row && row.started > 0
          ? Math.round((row.completed / row.started) * 100)
          : null,
      questions: quiz.questions,
    };
  });

  const ratings = published.reduce((total, quiz) => total + quiz.ratings, 0);
  const weighted = published.reduce(
    (total, quiz) => total + (quiz.avgRating ?? 0) * quiz.ratings,
    0,
  );

  return {
    published: published.length,
    plays30,
    plays30Delta:
      previous30 === 0
        ? null
        : Math.round(((plays30 - previous30) / previous30) * 100),
    players30: playerRows[0]?.total ?? 0,
    avgRating: ratings > 0 ? weighted / ratings : null,
    ratings,
    series,
    quizzes: quizRows,
    drafts: items
      .filter((quiz) => quiz.status === "DRAFT")
      .map(
        (quiz): DraftQuiz => ({
          slug: quiz.slug,
          title: quiz.title,
          questions: quiz.questions,
          note: draftNote(quiz.questions),
        }),
      ),
    attention: items
      .filter((quiz) => quiz.status === "SUSPENDED")
      .map((quiz) => ({
        slug: quiz.slug,
        title: quiz.title,
        reason: quiz.suspensionReason ?? "An admin has hidden this quiz.",
      })),
    activity,
  };
}
