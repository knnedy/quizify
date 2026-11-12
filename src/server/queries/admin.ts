import "server-only";
import { and, count, countDistinct, eq, isNull } from "drizzle-orm";
import { db } from "@/server/db";
import { creatorApplications, quizReports, quizzes } from "@/server/db/schema";
import type { AdminCounts } from "@/types/admin";

// Work waiting for staff: applications to review, and quizzes with open
// reports. Several reports on one quiz count once, and a quiz its creator
// already deleted has nothing left to decide.
export async function getAdminCounts(): Promise<AdminCounts> {
  const [applications, reports] = await Promise.all([
    db
      .select({ total: count() })
      .from(creatorApplications)
      .where(eq(creatorApplications.status, "PENDING")),
    db
      .select({ total: countDistinct(quizReports.quizId) })
      .from(quizReports)
      .innerJoin(quizzes, eq(quizzes.id, quizReports.quizId))
      .where(and(eq(quizReports.status, "OPEN"), isNull(quizzes.deletedAt))),
  ]);

  return {
    applications: applications[0]?.total ?? 0,
    reports: reports[0]?.total ?? 0,
  };
}
