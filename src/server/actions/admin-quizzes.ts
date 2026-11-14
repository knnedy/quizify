"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import {
  SUSPENSION_MESSAGE_MAX,
  SUSPENSION_MESSAGE_MIN,
} from "@/lib/moderation";
import {
  reportedQuizSchema,
  suspendReportedSchema,
  type ReportedQuizInput,
  type SuspendReportedInput,
} from "@/lib/schemas/admin-reports";
import { db } from "@/server/db";
import { moderationEvents } from "@/server/db/schema";
import {
  closeReports,
  lockQuiz,
  removeBlocker,
  removeQuiz,
  restoreBlocker,
  restoreQuiz,
  suspendBlocker,
  suspendQuiz,
} from "@/server/services/quiz-moderation";
import { getStaffActor } from "@/server/services/staff-actor";
import type { ActionResult } from "@/types/actions";

const SOMETHING_WRONG = "Something went wrong. Please try again.";

// The page, the reports queue and the badge in the sidebar
function refreshAdmin() {
  revalidatePath("/admin", "layout");
}

export async function suspendAdminQuiz(
  input: SuspendReportedInput,
): Promise<ActionResult> {
  const staff = await getStaffActor();
  if (!staff.ok) return staff;
  const { actor } = staff;

  const parsed = suspendReportedSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: `Write a message of ${SUSPENSION_MESSAGE_MIN} to ${SUSPENSION_MESSAGE_MAX} characters.`,
    };
  }
  const { quizId, message } = parsed.data;

  try {
    const result = await db.transaction(async (tx): Promise<ActionResult> => {
      const quiz = await lockQuiz(tx, quizId);
      if (!quiz) return { ok: false, error: "That quiz was not found." };

      const blocked = suspendBlocker(quiz);
      if (blocked) return { ok: false, error: blocked };

      // Open reports on the quiz are settled by this decision
      await closeReports(tx, {
        quizId,
        status: "ACTIONED",
        actorId: actor.id,
      });

      await suspendQuiz(tx, { quiz, actorId: actor.id, message });
      return { ok: true };
    });

    if (result.ok) refreshAdmin();
    return result;
  } catch (error) {
    console.error("suspendAdminQuiz failed", error);
    return { ok: false, error: SOMETHING_WRONG };
  }
}

export async function restoreAdminQuiz(
  input: ReportedQuizInput,
): Promise<ActionResult> {
  const staff = await getStaffActor();
  if (!staff.ok) return staff;
  const { actor } = staff;

  const parsed = reportedQuizSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "That request was not valid." };
  }
  const { quizId } = parsed.data;

  try {
    const result = await db.transaction(async (tx): Promise<ActionResult> => {
      const quiz = await lockQuiz(tx, quizId);
      if (!quiz) return { ok: false, error: "That quiz was not found." };

      const blocked = restoreBlocker(quiz);
      if (blocked) return { ok: false, error: blocked };

      // Making a quiz live again means its open reports were not upheld.
      // Otherwise it would sit in the queue with stale reports.
      const dismissed = await closeReports(tx, {
        quizId,
        status: "DISMISSED",
        actorId: actor.id,
      });

      if (dismissed > 0) {
        await tx.insert(moderationEvents).values({
          kind: "REPORT_DISMISSED",
          actorId: actor.id,
          quizId,
        });
      }

      await restoreQuiz(tx, {
        quiz,
        actorId: actor.id,
        note:
          dismissed > 0
            ? "Restored after the reports were dismissed"
            : undefined,
      });

      return { ok: true };
    });

    if (result.ok) refreshAdmin();
    return result;
  } catch (error) {
    console.error("restoreAdminQuiz failed", error);
    return { ok: false, error: SOMETHING_WRONG };
  }
}

export async function deleteAdminQuiz(
  input: ReportedQuizInput,
): Promise<ActionResult> {
  const staff = await getStaffActor();
  if (!staff.ok) return staff;
  const { actor } = staff;

  const parsed = reportedQuizSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "That request was not valid." };
  }
  const { quizId } = parsed.data;

  try {
    const result = await db.transaction(async (tx): Promise<ActionResult> => {
      const quiz = await lockQuiz(tx, quizId);
      if (!quiz) return { ok: false, error: "That quiz was not found." };

      const blocked = removeBlocker(quiz);
      if (blocked) return { ok: false, error: blocked };

      await closeReports(tx, {
        quizId,
        status: "ACTIONED",
        actorId: actor.id,
      });

      await removeQuiz(tx, { quiz, actorId: actor.id });
      return { ok: true };
    });

    if (result.ok) refreshAdmin();
    return result;
  } catch (error) {
    console.error("deleteAdminQuiz failed", error);
    return { ok: false, error: SOMETHING_WRONG };
  }
}
