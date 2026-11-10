"use server";

import "server-only";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  REJECTION_REASON_MAX,
  REJECTION_REASON_MIN,
} from "@/lib/creator-rules";
import {
  approveApplicationSchema,
  rejectApplicationSchema,
  type ApproveApplicationInput,
  type RejectApplicationInput,
} from "@/lib/schemas/admin-applications";
import { db } from "@/server/db";
import {
  creatorApplications,
  moderationEvents,
  users,
} from "@/server/db/schema";
import { getAdminActor } from "@/server/services/staff-actor";
import type { ActionResult } from "@/types/actions";

const SOMETHING_WRONG = "Something went wrong. Please try again.";

// The queue, its badge in the sidebar and the applicant's profile
function refreshAdmin() {
  revalidatePath("/admin", "layout");
}

export async function approveApplication(
  input: ApproveApplicationInput,
): Promise<ActionResult> {
  const admin = await getAdminActor();
  if (!admin.ok) return admin;
  const { actor } = admin;

  const parsed = approveApplicationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "That request was not valid." };
  }

  try {
    const result = await db.transaction(async (tx): Promise<ActionResult> => {
      // Locked, so two admins can't decide the same application twice
      const [application] = await tx
        .select({
          id: creatorApplications.id,
          userId: creatorApplications.userId,
          status: creatorApplications.status,
        })
        .from(creatorApplications)
        .where(eq(creatorApplications.id, parsed.data.applicationId))
        .limit(1)
        .for("update");

      if (!application) {
        return { ok: false, error: "That application was not found." };
      }
      if (application.status !== "PENDING") {
        return { ok: false, error: "This application was already reviewed." };
      }

      await tx
        .update(creatorApplications)
        .set({
          status: "APPROVED",
          reviewedBy: actor.id,
          reviewedAt: new Date(),
          rejectionReason: null,
        })
        .where(eq(creatorApplications.id, application.id));

      // Only players change role. Staff and creators keep theirs.
      await tx
        .update(users)
        .set({ role: "CREATOR" })
        .where(and(eq(users.id, application.userId), eq(users.role, "USER")));

      await tx.insert(moderationEvents).values({
        kind: "CREATOR_APPROVED",
        actorId: actor.id,
        userId: application.userId,
      });

      return { ok: true };
    });

    if (result.ok) refreshAdmin();
    return result;
  } catch (error) {
    console.error("approveApplication failed", error);
    return { ok: false, error: SOMETHING_WRONG };
  }
}

export async function rejectApplication(
  input: RejectApplicationInput,
): Promise<ActionResult> {
  const admin = await getAdminActor();
  if (!admin.ok) return admin;
  const { actor } = admin;

  const parsed = rejectApplicationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: `Write a message of ${REJECTION_REASON_MIN} to ${REJECTION_REASON_MAX} characters.`,
    };
  }
  const { applicationId, reason } = parsed.data;

  try {
    const result = await db.transaction(async (tx): Promise<ActionResult> => {
      const [application] = await tx
        .select({
          id: creatorApplications.id,
          userId: creatorApplications.userId,
          status: creatorApplications.status,
        })
        .from(creatorApplications)
        .where(eq(creatorApplications.id, applicationId))
        .limit(1)
        .for("update");

      if (!application) {
        return { ok: false, error: "That application was not found." };
      }
      if (application.status !== "PENDING") {
        return { ok: false, error: "This application was already reviewed." };
      }

      await tx
        .update(creatorApplications)
        .set({
          status: "REJECTED",
          reviewedBy: actor.id,
          reviewedAt: new Date(),
          rejectionReason: reason,
        })
        .where(eq(creatorApplications.id, application.id));

      await tx.insert(moderationEvents).values({
        kind: "CREATOR_REJECTED",
        actorId: actor.id,
        userId: application.userId,
        note: reason,
      });

      return { ok: true };
    });

    if (result.ok) refreshAdmin();
    return result;
  } catch (error) {
    console.error("rejectApplication failed", error);
    return { ok: false, error: SOMETHING_WRONG };
  }
}
