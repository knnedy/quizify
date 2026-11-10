import "server-only";
import { and, asc, count, desc, eq, inArray, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "@/server/db";
import { creatorApplications, quizAttempts, users } from "@/server/db/schema";
import type {
  Application,
  ApplicationStatus,
} from "@/types/admin-applications";
import { finishedAttempt } from "./attempt-filters";

const DAY = 86_400_000;
const PENDING_LIMIT = 200;
const DECIDED_LIMIT = 40;

const reviewer = alias(users, "application_reviewer");

// Pending goes oldest first so nobody waits at the bottom of the queue.
// Decided ones show the most recent decision first.
async function loadRows(status: ApplicationStatus, limit: number) {
  const order =
    status === "PENDING"
      ? [asc(creatorApplications.createdAt), asc(creatorApplications.id)]
      : [
          sql`${creatorApplications.reviewedAt} desc nulls last`,
          desc(creatorApplications.id),
        ];

  return db
    .select({
      id: creatorApplications.id,
      userId: creatorApplications.userId,
      status: creatorApplications.status,
      motivation: creatorApplications.motivation,
      createdAt: creatorApplications.createdAt,
      reviewedAt: creatorApplications.reviewedAt,
      rejectionReason: creatorApplications.rejectionReason,
      name: users.name,
      email: users.email,
      joinedAt: users.createdAt,
      totalXp: users.totalXp,
      reviewerName: reviewer.name,
    })
    .from(creatorApplications)
    .innerJoin(users, eq(users.id, creatorApplications.userId))
    .leftJoin(reviewer, eq(reviewer.id, creatorApplications.reviewedBy))
    .where(eq(creatorApplications.status, status))
    .orderBy(...order)
    .limit(limit);
}

export async function getApplications(): Promise<{
  applications: Application[];
  counts: Record<ApplicationStatus, number>;
}> {
  const now = new Date();

  const [pending, approved, rejected, countRows] = await Promise.all([
    loadRows("PENDING", PENDING_LIMIT),
    loadRows("APPROVED", DECIDED_LIMIT),
    loadRows("REJECTED", DECIDED_LIMIT),
    db
      .select({ status: creatorApplications.status, total: count() })
      .from(creatorApplications)
      .groupBy(creatorApplications.status),
  ]);

  const counts: Record<ApplicationStatus, number> = {
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0,
  };
  for (const row of countRows) counts[row.status] = row.total;

  const rows = [...pending, ...approved, ...rejected];
  if (rows.length === 0) return { applications: [], counts };

  const userIds = [...new Set(rows.map((row) => row.userId))];

  const [completedRows, historyRows] = await Promise.all([
    db
      .select({
        userId: quizAttempts.userId,
        total: sql<number>`count(distinct ${quizAttempts.quizId})::int`,
      })
      .from(quizAttempts)
      .where(and(inArray(quizAttempts.userId, userIds), finishedAttempt))
      .groupBy(quizAttempts.userId),
    // Every application by these people, for "number of tries" and "rejected
    // before"
    db
      .select({
        id: creatorApplications.id,
        userId: creatorApplications.userId,
        status: creatorApplications.status,
        createdAt: creatorApplications.createdAt,
        reviewedAt: creatorApplications.reviewedAt,
        rejectionReason: creatorApplications.rejectionReason,
      })
      .from(creatorApplications)
      .where(inArray(creatorApplications.userId, userIds))
      .orderBy(asc(creatorApplications.createdAt), asc(creatorApplications.id)),
  ]);

  const completedByUser = new Map(
    completedRows.map((row) => [row.userId, row.total]),
  );

  const historyByUser = new Map<number, typeof historyRows>();
  for (const entry of historyRows) {
    const list = historyByUser.get(entry.userId) ?? [];
    list.push(entry);
    historyByUser.set(entry.userId, list);
  }

  const applications = rows.map((row): Application => {
    const history = historyByUser.get(row.userId) ?? [];
    const index = history.findIndex((entry) => entry.id === row.id);
    const lastRejection = history
      .slice(0, Math.max(index, 0))
      .reverse()
      .find((entry) => entry.status === "REJECTED");

    return {
      id: row.id,
      status: row.status,
      applicant: {
        name: row.name,
        email: row.email,
        joinedAt: row.joinedAt,
        accountAgeDays: Math.max(
          0,
          Math.floor((now.getTime() - row.joinedAt.getTime()) / DAY),
        ),
        quizzesCompleted: completedByUser.get(row.userId) ?? 0,
        totalXp: row.totalXp,
      },
      motivation: row.motivation,
      submittedAt: row.createdAt,
      waitingDays: Math.max(
        0,
        Math.floor((now.getTime() - row.createdAt.getTime()) / DAY),
      ),
      attempt: Math.max(index, 0) + 1,
      previous: lastRejection
        ? {
            reason: lastRejection.rejectionReason ?? "No message was recorded.",
            reviewedAt: lastRejection.reviewedAt ?? lastRejection.createdAt,
          }
        : null,
      decision:
        row.status !== "PENDING" && row.reviewedAt
          ? {
              reviewedBy: row.reviewerName,
              reviewedAt: row.reviewedAt,
              reason: row.rejectionReason,
            }
          : null,
    };
  });

  return { applications, counts };
}
