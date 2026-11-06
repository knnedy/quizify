import "server-only";
import { count, countDistinct, eq } from "drizzle-orm";
import { db } from "@/server/db";
import { creatorApplications, quizReports } from "@/server/db/schema";
import type { AdminCounts } from "@/types/admin";

// Work waiting for staff: applications to review, and quizzes with open
// reports. Several reports on one quiz count once.
export async function getAdminCounts(): Promise<AdminCounts> {
  const [applications, reports] = await Promise.all([
    db
      .select({ total: count() })
      .from(creatorApplications)
      .where(eq(creatorApplications.status, "PENDING")),
    db
      .select({ total: countDistinct(quizReports.quizId) })
      .from(quizReports)
      .where(eq(quizReports.status, "OPEN")),
  ]);

  return {
    applications: applications[0]?.total ?? 0,
    reports: reports[0]?.total ?? 0,
  };
}
