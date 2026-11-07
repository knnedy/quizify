import "server-only";
import { cache } from "react";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  isNull,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import {
  USERS_PAGE_SIZE,
  type SortDirection,
  type UserFilter,
  type UserQuery,
  type UserSort,
} from "@/lib/admin-users";
import { isCurrentlyBanned } from "@/lib/ban";
import { canCreateQuizzes } from "@/lib/roles";
import { activeStreak } from "@/lib/streak";
import { db } from "@/server/db";
import {
  attemptAnswers,
  moderationEvents,
  quizAttempts,
  quizReports,
  quizzes,
  sessions,
  userNotes,
  users,
} from "@/server/db/schema";
import type {
  AdminNote,
  AdminUser,
  Ban,
  CreatorStats,
  HistoryEntry,
  HistoryKind,
  PlayEntry,
  UserRow,
  UserSummary,
} from "@/types/admin-users";
import { finishedAttempt } from "./attempt-filters";
import { likePattern } from "./like";
import { listMyQuizzes } from "./my-quizzes";

const DAY = 86_400_000;
const WEEKS = 12;
const RECENT_LIMIT = 5;
const CREATOR_QUIZ_LIMIT = 20;

const eventActor = alias(users, "event_actor");
const noteAuthor = alias(users, "note_author");

// Per user counts, joined into the list query
const attemptStats = db
  .select({
    userId: quizAttempts.userId,
    completed: sql<number>`count(distinct ${quizAttempts.quizId})::int`.as(
      "completed_quizzes",
    ),
  })
  .from(quizAttempts)
  .where(finishedAttempt)
  .groupBy(quizAttempts.userId)
  .as("user_attempt_stats");

const publishedStats = db
  .select({
    userId: quizzes.userId,
    total: sql<number>`count(*)::int`.as("published_total"),
  })
  .from(quizzes)
  .where(and(eq(quizzes.status, "PUBLISHED"), isNull(quizzes.deletedAt)))
  .groupBy(quizzes.userId)
  .as("user_published_stats");

const completedCount = sql<number>`coalesce(${attemptStats.completed}, 0)`;
const publishedCount = sql<number>`coalesce(${publishedStats.total}, 0)`;

// A ban counts while it has no end date, or the end date is still ahead
function currentlyBanned(now: Date): SQL {
  return sql`(${eq(users.banned, true)} and (${isNull(users.banExpires)} or ${gt(users.banExpires, now)}))`;
}

function filterCondition(filter: UserFilter, now: Date): SQL | undefined {
  switch (filter) {
    case "players":
      return eq(users.role, "USER");
    case "creators":
      return eq(users.role, "CREATOR");
    case "staff":
      return inArray(users.role, ["MODERATOR", "ADMIN"]);
    case "banned":
      return currentlyBanned(now);
    default:
      return undefined;
  }
}

function orderFor(sort: UserSort, dir: SortDirection) {
  const direction = dir === "asc" ? asc : desc;

  switch (sort) {
    case "name":
      return [direction(sql`lower(${users.name})`), asc(users.id)];
    case "joined":
      return [direction(users.createdAt), asc(users.id)];
    case "active":
      // Never active sorts as the oldest
      return [
        dir === "asc"
          ? sql`${users.lastActivityDate} asc nulls first`
          : sql`${users.lastActivityDate} desc nulls last`,
        asc(users.id),
      ];
    case "xp":
      return [direction(users.totalXp), asc(users.id)];
    case "quizzes":
      return [direction(completedCount), asc(users.id)];
  }
}

function daysSince(date: Date | null, now: Date) {
  if (!date) return null;
  return Math.max(0, Math.floor((now.getTime() - date.getTime()) / DAY));
}

export async function listUsers(query: UserQuery) {
  const now = new Date();

  const searchCondition = query.q
    ? or(
        ilike(users.name, likePattern(query.q)),
        ilike(users.email, likePattern(query.q)),
      )
    : undefined;

  // The filter tabs show how many users each one would list for this search
  const [countRow] = await db
    .select({
      all: sql<number>`count(*)::int`,
      players: sql<number>`(count(*) filter (where ${eq(users.role, "USER")}))::int`,
      creators: sql<number>`(count(*) filter (where ${eq(users.role, "CREATOR")}))::int`,
      staff: sql<number>`(count(*) filter (where ${inArray(users.role, ["MODERATOR", "ADMIN"])}))::int`,
      banned: sql<number>`(count(*) filter (where ${currentlyBanned(now)}))::int`,
    })
    .from(users)
    .where(searchCondition);

  const counts: Record<UserFilter, number> = {
    all: countRow?.all ?? 0,
    players: countRow?.players ?? 0,
    creators: countRow?.creators ?? 0,
    staff: countRow?.staff ?? 0,
    banned: countRow?.banned ?? 0,
  };

  const total = counts[query.filter];
  const pageCount = Math.max(1, Math.ceil(total / USERS_PAGE_SIZE));
  const page = Math.min(query.page, pageCount);

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      lastActivityDate: users.lastActivityDate,
      totalXp: users.totalXp,
      banned: users.banned,
      banReason: users.banReason,
      banExpires: users.banExpires,
      completed: completedCount,
      published: publishedCount,
    })
    .from(users)
    .leftJoin(attemptStats, eq(attemptStats.userId, users.id))
    .leftJoin(publishedStats, eq(publishedStats.userId, users.id))
    .where(and(searchCondition, filterCondition(query.filter, now)))
    .orderBy(...orderFor(query.sort, query.dir))
    .limit(USERS_PAGE_SIZE)
    .offset((page - 1) * USERS_PAGE_SIZE);

  const items = rows.map(
    (row): UserRow => ({
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      joinedAt: row.createdAt,
      lastActiveDays: daysSince(row.lastActivityDate, now),
      quizzesCompleted: row.completed,
      totalXp: row.totalXp,
      published: row.published,
      ban: isCurrentlyBanned(row.banned, row.banExpires, now)
        ? {
            reason: row.banReason ?? "",
            bannedAt: null,
            bannedBy: null,
            expiresAt: row.banExpires,
          }
        : null,
    }),
  );

  return { items, total, page, pageCount, counts };
}

export async function getUserSummary(): Promise<UserSummary> {
  const now = new Date();
  const week = new Date(now.getTime() - 7 * DAY);

  const [row] = await db
    .select({
      total: sql<number>`count(*)::int`,
      newThisWeek: sql<number>`(count(*) filter (where ${gte(users.createdAt, week)}))::int`,
      activeThisWeek: sql<number>`(count(*) filter (where ${gte(users.lastActivityDate, week)}))::int`,
      banned: sql<number>`(count(*) filter (where ${currentlyBanned(now)}))::int`,
    })
    .from(users);

  return {
    total: row?.total ?? 0,
    newThisWeek: row?.newThisWeek ?? 0,
    activeThisWeek: row?.activeThisWeek ?? 0,
    banned: row?.banned ?? 0,
  };
}

async function loadRecent(userId: number): Promise<PlayEntry[]> {
  const rows = await db
    .select({
      attemptId: quizAttempts.id,
      title: quizzes.title,
      slug: quizzes.slug,
      score: quizAttempts.score,
      at: quizAttempts.completedAt,
    })
    .from(quizAttempts)
    .innerJoin(quizzes, eq(quizzes.id, quizAttempts.quizId))
    .where(and(eq(quizAttempts.userId, userId), finishedAttempt))
    .orderBy(
      sql`${quizAttempts.completedAt} desc nulls last`,
      desc(quizAttempts.id),
    )
    .limit(RECENT_LIMIT);

  if (rows.length === 0) return [];

  const totals = await db
    .select({ attemptId: attemptAnswers.attemptId, total: count() })
    .from(attemptAnswers)
    .where(
      inArray(
        attemptAnswers.attemptId,
        rows.map((row) => row.attemptId),
      ),
    )
    .groupBy(attemptAnswers.attemptId);

  const totalByAttempt = new Map(totals.map((r) => [r.attemptId, r.total]));

  return rows.map((row) => ({
    quiz: row.title,
    slug: row.slug,
    score: row.score,
    total: totalByAttempt.get(row.attemptId) ?? 0,
    at: row.at ?? new Date(0),
  }));
}

// Finished quizzes per week for the last 12 weeks, oldest first
function weeklyCounts(dates: (Date | null)[], now: Date) {
  const buckets = Array<number>(WEEKS).fill(0);

  for (const at of dates) {
    if (!at) continue;

    const age = Math.floor((now.getTime() - at.getTime()) / (7 * DAY));
    if (age < 0 || age >= WEEKS) continue;

    const index = WEEKS - 1 - age;
    buckets[index] = (buckets[index] ?? 0) + 1;
  }

  return buckets;
}

const historyKinds: Record<string, HistoryKind> = {
  CREATOR_APPROVED: "CREATOR_APPROVED",
  CREATOR_REVOKED: "CREATOR_REVOKED",
  USER_BANNED: "BANNED",
  USER_UNBANNED: "UNBANNED",
};

// Cached per request, so the page and its metadata share one lookup
export const getAdminUser = cache(
  async (id: number): Promise<AdminUser | null> => {
    const now = new Date();

    const [row] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!row) return null;

    const [
      statsRows,
      weeklyRows,
      recent,
      items,
      reportRows,
      eventRows,
      noteRows,
      sessionRows,
    ] = await Promise.all([
      db
        .select({
          completed: sql<number>`count(distinct ${quizAttempts.quizId})::int`,
          perfect: sql<number>`(count(distinct ${quizAttempts.quizId}) filter (where ${quizAttempts.percentage} = 100))::int`,
          average: sql<
            number | null
          >`round(avg(${quizAttempts.percentage}))::int`,
        })
        .from(quizAttempts)
        .where(and(eq(quizAttempts.userId, id), finishedAttempt)),
      db
        .select({ at: quizAttempts.completedAt })
        .from(quizAttempts)
        .where(
          and(
            eq(quizAttempts.userId, id),
            finishedAttempt,
            gte(
              quizAttempts.completedAt,
              new Date(now.getTime() - WEEKS * 7 * DAY),
            ),
          ),
        )
        .limit(5000),
      loadRecent(id),
      listMyQuizzes(id),
      db
        .select({ total: count() })
        .from(quizReports)
        .innerJoin(quizzes, eq(quizzes.id, quizReports.quizId))
        .where(
          and(
            eq(quizzes.userId, id),
            isNull(quizzes.deletedAt),
            eq(quizReports.status, "OPEN"),
          ),
        ),
      db
        .select({
          kind: moderationEvents.kind,
          at: moderationEvents.createdAt,
          by: eventActor.name,
          note: moderationEvents.note,
        })
        .from(moderationEvents)
        .leftJoin(eventActor, eq(eventActor.id, moderationEvents.actorId))
        .where(
          and(
            eq(moderationEvents.userId, id),
            inArray(moderationEvents.kind, [
              "CREATOR_APPROVED",
              "CREATOR_REVOKED",
              "USER_BANNED",
              "USER_UNBANNED",
            ]),
          ),
        )
        .orderBy(desc(moderationEvents.createdAt), desc(moderationEvents.id)),
      db
        .select({
          id: userNotes.id,
          text: userNotes.body,
          at: userNotes.createdAt,
          by: noteAuthor.name,
        })
        .from(userNotes)
        .leftJoin(noteAuthor, eq(noteAuthor.id, userNotes.authorId))
        .where(eq(userNotes.userId, id))
        .orderBy(desc(userNotes.createdAt), desc(userNotes.id)),
      db
        .select({ total: count() })
        .from(sessions)
        .where(and(eq(sessions.userId, id), gt(sessions.expiresAt, now))),
    ]);

    const history: HistoryEntry[] = [
      ...eventRows.map(
        (event): HistoryEntry => ({
          kind: historyKinds[event.kind] ?? "JOINED",
          at: event.at,
          by: event.by,
          note: event.note,
        }),
      ),
      { kind: "JOINED", at: row.createdAt, by: null, note: null },
    ];

    const banEvent = eventRows.find((event) => event.kind === "USER_BANNED");
    const ban: Ban | null = isCurrentlyBanned(row.banned, row.banExpires, now)
      ? {
          reason: row.banReason ?? "",
          bannedAt: banEvent?.at ?? null,
          bannedBy: banEvent?.by ?? null,
          expiresAt: row.banExpires,
        }
      : null;

    const published = items.filter((quiz) => quiz.status === "PUBLISHED");
    const ratings = published.reduce((sum, quiz) => sum + quiz.ratings, 0);
    const weighted = published.reduce(
      (sum, quiz) => sum + (quiz.avgRating ?? 0) * quiz.ratings,
      0,
    );

    const creator: CreatorStats | null =
      canCreateQuizzes(row.role) || items.length > 0
        ? {
            published: published.length,
            drafts: items.filter((quiz) => quiz.status === "DRAFT").length,
            suspended: items.filter((quiz) => quiz.status === "SUSPENDED")
              .length,
            plays: items.reduce((sum, quiz) => sum + quiz.plays, 0),
            avgRating: ratings > 0 ? weighted / ratings : null,
            openReports: reportRows[0]?.total ?? 0,
            quizzes: items.slice(0, CREATOR_QUIZ_LIMIT).map((quiz) => ({
              title: quiz.title,
              slug: quiz.slug,
              status: quiz.status,
              plays: quiz.plays,
            })),
          }
        : null;

    const streak = activeStreak({
      lastActivity: row.lastActivityDate,
      current: row.currentStreak,
      now,
      timeZone: row.timezone,
    });

    const notes: AdminNote[] = noteRows.map((note) => ({
      id: note.id,
      by: note.by ?? "Former staff",
      at: note.at,
      text: note.text,
    }));

    return {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      joinedAt: row.createdAt,
      lastActiveDays: daysSince(row.lastActivityDate, now),
      quizzesCompleted: statsRows[0]?.completed ?? 0,
      totalXp: row.totalXp,
      published: published.length,
      ban,
      stats: {
        completed: statsRows[0]?.completed ?? 0,
        averagePercentage: statsRows[0]?.average ?? null,
        totalXp: row.totalXp,
        currentStreak: streak,
        bestStreak: Math.max(row.bestStreak, streak),
        perfectScores: statsRows[0]?.perfect ?? 0,
        weekly: weeklyCounts(
          weeklyRows.map((entry) => entry.at),
          now,
        ),
      },
      recent,
      creator,
      history,
      notes,
      account: {
        sessions: sessionRows[0]?.total ?? 0,
        timezone: row.timezone,
      },
    };
  },
);
