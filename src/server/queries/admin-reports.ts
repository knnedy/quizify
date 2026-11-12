import "server-only";
import {
  and,
  count,
  countDistinct,
  desc,
  eq,
  inArray,
  isNull,
  ne,
  sql,
  type SQL,
} from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { compareOpenReports } from "@/lib/admin-reports";
import { canCreateQuizzes } from "@/lib/roles";
import { db } from "@/server/db";
import {
  categories,
  moderationEvents,
  questions,
  quizAttempts,
  quizRatings,
  quizReports,
  quizzes,
  users,
} from "@/server/db/schema";
import type {
  QuizVisibility,
  Report,
  ReportedQuiz,
  ReportsView,
  ReportStatus,
} from "@/types/admin-reports";
import { finishedAttempt } from "./attempt-filters";

const DAY = 86_400_000;
const REPORT_LIMIT = 2000;
const RESOLVED_QUIZ_LIMIT = 40;

const reporter = alias(users, "reporter");
const decisionActor = alias(users, "decision_actor");

async function loadReports(where: SQL | undefined) {
  return db
    .select({
      id: quizReports.id,
      quizId: quizReports.quizId,
      status: quizReports.status,
      reason: quizReports.reason,
      details: quizReports.details,
      createdAt: quizReports.createdAt,
      reporterId: quizReports.reporterId,
      reporterName: reporter.name,
    })
    .from(quizReports)
    .innerJoin(reporter, eq(reporter.id, quizReports.reporterId))
    .where(where)
    .orderBy(desc(quizReports.createdAt), desc(quizReports.id))
    .limit(REPORT_LIMIT);
}

type ReportRow = Awaited<ReturnType<typeof loadReports>>[number];

function groupByQuiz(rows: ReportRow[]) {
  const groups = new Map<number, ReportRow[]>();

  for (const row of rows) {
    const list = groups.get(row.quizId) ?? [];
    list.push(row);
    groups.set(row.quizId, list);
  }

  return groups;
}

function decisionStatus(kind: string): ReportStatus | null {
  switch (kind) {
    case "REPORT_DISMISSED":
      return "DISMISSED";
    case "QUIZ_SUSPENDED":
      return "SUSPENDED";
    case "QUIZ_DELETED":
      return "DELETED";
    default:
      return null;
  }
}

function visibilityOf(quiz: {
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED" | "SUSPENDED";
  suspendedBy: number | null;
  deletedAt: Date | null;
}): QuizVisibility {
  if (quiz.deletedAt) return "DELETED";
  if (quiz.status === "PUBLISHED") return "LIVE";
  if (quiz.status === "SUSPENDED") {
    return quiz.suspendedBy === null ? "HIDDEN_AUTO" : "HIDDEN_STAFF";
  }
  return "UNPUBLISHED";
}

// The open queue has one item per quiz with open reports. The resolved list
// has the quizzes decided most recently, with what was decided.
export async function getReports(): Promise<ReportsView> {
  const now = new Date();

  const [openRows, recent, openCount, resolvedCount] = await Promise.all([
    loadReports(eq(quizReports.status, "OPEN")),
    db
      .select({ quizId: quizReports.quizId })
      .from(quizReports)
      .where(ne(quizReports.status, "OPEN"))
      .groupBy(quizReports.quizId)
      .orderBy(
        sql`max(${quizReports.reviewedAt}) desc nulls last`,
        desc(quizReports.quizId),
      )
      .limit(RESOLVED_QUIZ_LIMIT),
    db
      .select({ total: countDistinct(quizReports.quizId) })
      .from(quizReports)
      .innerJoin(quizzes, eq(quizzes.id, quizReports.quizId))
      .where(and(eq(quizReports.status, "OPEN"), isNull(quizzes.deletedAt))),
    db
      .select({ total: countDistinct(quizReports.quizId) })
      .from(quizReports)
      .where(ne(quizReports.status, "OPEN")),
  ]);

  const counts = {
    open: openCount[0]?.total ?? 0,
    resolved: resolvedCount[0]?.total ?? 0,
  };

  const recentIds = recent.map((row) => row.quizId);
  const resolvedRows =
    recentIds.length === 0
      ? []
      : await loadReports(
          and(
            ne(quizReports.status, "OPEN"),
            inArray(quizReports.quizId, recentIds),
          ),
        );

  const quizIds = [
    ...new Set([...openRows.map((row) => row.quizId), ...recentIds]),
  ];
  if (quizIds.length === 0) return { open: [], resolved: [], counts };

  const reporterIds = [
    ...new Set([...openRows, ...resolvedRows].map((row) => row.reporterId)),
  ];

  const [quizRows, questionRows, playRows, ratingRows, completedRows, events] =
    await Promise.all([
      db
        .select({
          id: quizzes.id,
          slug: quizzes.slug,
          title: quizzes.title,
          status: quizzes.status,
          suspendedBy: quizzes.suspendedBy,
          deletedAt: quizzes.deletedAt,
          publishedAt: quizzes.publishedAt,
          ownerId: quizzes.userId,
          categoryName: categories.name,
          categorySlug: categories.slug,
        })
        .from(quizzes)
        .innerJoin(categories, eq(categories.id, quizzes.categoryId))
        .where(inArray(quizzes.id, quizIds)),
      db
        .select({ quizId: questions.quizId, total: count() })
        .from(questions)
        .where(inArray(questions.quizId, quizIds))
        .groupBy(questions.quizId),
      db
        .select({ quizId: quizAttempts.quizId, total: count() })
        .from(quizAttempts)
        .where(and(inArray(quizAttempts.quizId, quizIds), finishedAttempt))
        .groupBy(quizAttempts.quizId),
      db
        .select({
          quizId: quizRatings.quizId,
          average: sql<number>`avg(${quizRatings.rating})::float`,
        })
        .from(quizRatings)
        .where(inArray(quizRatings.quizId, quizIds))
        .groupBy(quizRatings.quizId),
      db
        .select({
          userId: quizAttempts.userId,
          total: sql<number>`count(distinct ${quizAttempts.quizId})::int`,
        })
        .from(quizAttempts)
        .where(and(inArray(quizAttempts.userId, reporterIds), finishedAttempt))
        .groupBy(quizAttempts.userId),
      recentIds.length === 0
        ? Promise.resolve([])
        : db
            .select({
              quizId: moderationEvents.quizId,
              kind: moderationEvents.kind,
              at: moderationEvents.createdAt,
              note: moderationEvents.note,
              by: decisionActor.name,
            })
            .from(moderationEvents)
            .leftJoin(
              decisionActor,
              eq(decisionActor.id, moderationEvents.actorId),
            )
            .where(
              and(
                inArray(moderationEvents.quizId, recentIds),
                inArray(moderationEvents.kind, [
                  "REPORT_DISMISSED",
                  "QUIZ_SUSPENDED",
                  "QUIZ_DELETED",
                ]),
              ),
            )
            .orderBy(
              desc(moderationEvents.createdAt),
              desc(moderationEvents.id),
            ),
    ]);

  const ownerIds = [
    ...new Set(
      quizRows.flatMap((quiz) => (quiz.ownerId === null ? [] : [quiz.ownerId])),
    ),
  ];

  const [ownerRows, publishedRows, suspensionRows, banRows] =
    ownerIds.length === 0
      ? [[], [], [], []]
      : await Promise.all([
          db
            .select({ id: users.id, name: users.name, role: users.role })
            .from(users)
            .where(inArray(users.id, ownerIds)),
          db
            .select({ userId: quizzes.userId, total: count() })
            .from(quizzes)
            .where(
              and(
                inArray(quizzes.userId, ownerIds),
                eq(quizzes.status, "PUBLISHED"),
                isNull(quizzes.deletedAt),
              ),
            )
            .groupBy(quizzes.userId),
          // Earlier actions against their quizzes
          db
            .select({ userId: quizzes.userId, total: count() })
            .from(moderationEvents)
            .innerJoin(quizzes, eq(quizzes.id, moderationEvents.quizId))
            .where(
              and(
                inArray(quizzes.userId, ownerIds),
                inArray(moderationEvents.kind, [
                  "QUIZ_SUSPENDED",
                  "QUIZ_DELETED",
                ]),
              ),
            )
            .groupBy(quizzes.userId),
          // And against the person
          db
            .select({ userId: moderationEvents.userId, total: count() })
            .from(moderationEvents)
            .where(
              and(
                inArray(moderationEvents.userId, ownerIds),
                eq(moderationEvents.kind, "USER_BANNED"),
              ),
            )
            .groupBy(moderationEvents.userId),
        ]);

  const quizById = new Map(quizRows.map((quiz) => [quiz.id, quiz]));
  const questionCounts = new Map(questionRows.map((r) => [r.quizId, r.total]));
  const playCounts = new Map(playRows.map((r) => [r.quizId, r.total]));
  const averages = new Map(ratingRows.map((r) => [r.quizId, r.average]));
  const completedBy = new Map(completedRows.map((r) => [r.userId, r.total]));
  const ownerById = new Map(ownerRows.map((owner) => [owner.id, owner]));
  const publishedBy = new Map(publishedRows.map((r) => [r.userId, r.total]));

  const strikesBy = new Map<number, number>();
  for (const row of [...suspensionRows, ...banRows]) {
    if (row.userId === null) continue;
    strikesBy.set(row.userId, (strikesBy.get(row.userId) ?? 0) + row.total);
  }

  const decisionBy = new Map<number, (typeof events)[number]>();
  for (const event of events) {
    if (event.quizId !== null && !decisionBy.has(event.quizId)) {
      decisionBy.set(event.quizId, event);
    }
  }

  function toReport(row: ReportRow): Report {
    return {
      id: row.id,
      reporter: {
        name: row.reporterName,
        completed: completedBy.get(row.reporterId) ?? 0,
      },
      reason: row.reason,
      details: row.details,
      daysAgo: Math.max(
        0,
        Math.floor((now.getTime() - row.createdAt.getTime()) / DAY),
      ),
    };
  }

  function build(
    quizId: number,
    rows: ReportRow[],
    status: ReportStatus,
    decision: ReportedQuiz["decision"],
  ): ReportedQuiz | null {
    const quiz = quizById.get(quizId);
    if (!quiz) return null;

    const owner =
      quiz.ownerId === null ? null : (ownerById.get(quiz.ownerId) ?? null);

    return {
      id: quizId,
      status,
      visibility: visibilityOf(quiz),
      quiz: {
        slug: quiz.slug,
        title: quiz.title,
        category: { name: quiz.categoryName, slug: quiz.categorySlug },
        questions: questionCounts.get(quizId) ?? 0,
        plays: playCounts.get(quizId) ?? 0,
        avgRating: averages.get(quizId) ?? null,
        publishedDaysAgo: quiz.publishedAt
          ? Math.max(
              0,
              Math.floor((now.getTime() - quiz.publishedAt.getTime()) / DAY),
            )
          : null,
      },
      creator: owner
        ? {
            id: owner.id,
            name: owner.name,
            former: !canCreateQuizzes(owner.role),
            published: publishedBy.get(owner.id) ?? 0,
            strikes: strikesBy.get(owner.id) ?? 0,
          }
        : null,
      reports: rows.map(toReport),
      decision,
    };
  }

  const open: ReportedQuiz[] = [];
  for (const [quizId, rows] of groupByQuiz(openRows)) {
    const item = build(quizId, rows, "OPEN", null);

    // Reports on a quiz its creator already deleted have nothing left to decide
    if (item && item.visibility !== "DELETED") open.push(item);
  }
  open.sort(compareOpenReports);

  const resolvedGroups = groupByQuiz(resolvedRows);
  const resolved = recentIds.flatMap((quizId): ReportedQuiz[] => {
    const rows = resolvedGroups.get(quizId);
    const quiz = quizById.get(quizId);
    if (!rows || !quiz) return [];

    const event = decisionBy.get(quizId);
    const fromEvent = event ? decisionStatus(event.kind) : null;

    // Reports closed without a recorded decision, for example by SQL
    const fallback: ReportStatus = rows.some((row) => row.status === "ACTIONED")
      ? quiz.deletedAt
        ? "DELETED"
        : "SUSPENDED"
      : "DISMISSED";

    const item = build(
      quizId,
      rows,
      fromEvent ?? fallback,
      event ? { by: event.by, at: event.at, note: event.note } : null,
    );
    return item ? [item] : [];
  });

  return { open, resolved, counts };
}
