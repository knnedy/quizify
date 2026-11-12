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
  isHiddenAutomatically,
  lockQuiz,
  removeBlocker,
  removeQuiz,
  restoreQuiz,
  suspendBlocker,
  suspendQuiz,
} from "@/server/services/quiz-moderation";
import { getStaffActor } from "@/server/services/staff-actor";
import type { ActionResult } from "@/types/actions";

const SOMETHING_WRONG = "Something went wrong. Please try again.";
const ALREADY_REVIEWED = "These reports were already reviewed.";

// The queue and its badge in the sidebar
function refreshAdmin() {
  revalidatePath("/admin", "layout");
}

export async function dismissReports(
  input: ReportedQuizInput,
): Promise<ActionResult<{ restored: boolean }>> {
  const staff = await getStaffActor();
  if (!staff.ok) return staff;
  const { actor } = staff;

  const parsed = reportedQuizSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "That request was not valid." };
  }
  const { quizId } = parsed.data;

  try {
    const result = await db.transaction(
      async (tx): Promise<ActionResult<{ restored: boolean }>> => {
        const quiz = await lockQuiz(tx, quizId);
        if (!quiz) return { ok: false, error: "That quiz was not found." };

        const closed = await closeReports(tx, {
          quizId,
          status: "DISMISSED",
          actorId: actor.id,
        });
        if (closed === 0) return { ok: false, error: ALREADY_REVIEWED };

        // A quiz hidden by the reports comes back once they are dismissed.
        // One a person suspended stays suspended.
        const restored = isHiddenAutomatically(quiz);
        if (restored) {
          await restoreQuiz(tx, {
            quiz,
            actorId: actor.id,
            note: "Restored after the reports were dismissed",
          });
        }

        await tx.insert(moderationEvents).values({
          kind: "REPORT_DISMISSED",
          actorId: actor.id,
          quizId,
        });

        return { ok: true, restored };
      },
    );

    if (result.ok) refreshAdmin();
    return result;
  } catch (error) {
    console.error("dismissReports failed", error);
    return { ok: false, error: SOMETHING_WRONG };
  }
}

export async function suspendReported(
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

      const closed = await closeReports(tx, {
        quizId,
        status: "ACTIONED",
        actorId: actor.id,
      });
      if (closed === 0) return { ok: false, error: ALREADY_REVIEWED };

      await suspendQuiz(tx, { quiz, actorId: actor.id, message });
      return { ok: true };
    });

    if (result.ok) refreshAdmin();
    return result;
  } catch (error) {
    console.error("suspendReported failed", error);
    return { ok: false, error: SOMETHING_WRONG };
  }
}

export async function deleteReported(
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

      const closed = await closeReports(tx, {
        quizId,
        status: "ACTIONED",
        actorId: actor.id,
      });
      if (closed === 0) return { ok: false, error: ALREADY_REVIEWED };

      await removeQuiz(tx, { quiz, actorId: actor.id });
      return { ok: true };
    });

    if (result.ok) refreshAdmin();
    return result;
  } catch (error) {
    console.error("deleteReported failed", error);
    return { ok: false, error: SOMETHING_WRONG };
  }
}
