"use server";

import "server-only";
import { and, count, eq } from "drizzle-orm";
import { reportQuizSchema, type ReportQuizInput } from "@/lib/schemas/report";
import { db } from "@/server/db";
import { moderationEvents, quizReports, quizzes } from "@/server/db/schema";
import { reachableByLink } from "@/server/queries/visibility";
import { getOptionalUser } from "@/server/session";
import type { ActionResult } from "@/types/actions";

// This many different people with open reports hide a quiz automatically
const AUTO_HIDE_REPORTS = 3;

export async function reportQuiz(
  input: ReportQuizInput,
): Promise<ActionResult> {
  const user = await getOptionalUser();
  if (!user) return { ok: false, error: "Sign in to report a quiz." };

  const parsed = reportQuizSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Pick a reason and keep the details short." };
  }
  const { slug, reason, details } = parsed.data;

  try {
    return await db.transaction(async (tx): Promise<ActionResult> => {
      // Locking the quiz row makes simultaneous reports count one at a time
      const [quiz] = await tx
        .select({ id: quizzes.id, ownerId: quizzes.userId })
        .from(quizzes)
        .where(and(eq(quizzes.slug, slug), reachableByLink))
        .limit(1)
        .for("update");

      if (!quiz) return { ok: false, error: "That quiz is not available." };
      if (quiz.ownerId === user.id) {
        return { ok: false, error: "You can't report your own quiz." };
      }

      const inserted = await tx
        .insert(quizReports)
        .values({
          quizId: quiz.id,
          reporterId: user.id,
          reason,
          details: details ? details : null,
        })
        .onConflictDoNothing()
        .returning({ id: quizReports.id });

      if (inserted.length === 0) {
        return { ok: false, error: "You have already reported this quiz." };
      }

      const [open] = await tx
        .select({ total: count() })
        .from(quizReports)
        .where(
          and(eq(quizReports.quizId, quiz.id), eq(quizReports.status, "OPEN")),
        );

      if ((open?.total ?? 0) >= AUTO_HIDE_REPORTS) {
        await tx
          .update(quizzes)
          .set({
            status: "SUSPENDED",
            suspendedAt: new Date(),
            suspendedBy: null,
            suspensionReason: null,
          })
          .where(eq(quizzes.id, quiz.id));

        await tx.insert(moderationEvents).values({
          kind: "QUIZ_HIDDEN",
          actorId: null,
          quizId: quiz.id,
          note: `Hidden automatically after ${AUTO_HIDE_REPORTS} reports`,
        });
      }

      return { ok: true };
    });
  } catch (error) {
    console.error("reportQuiz failed", error);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}
