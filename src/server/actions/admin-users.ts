"use server";

import "server-only";
import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  BAN_REASON_MAX,
  BAN_REASON_MIN,
  NOTE_MAX,
  NOTE_MIN,
} from "@/lib/admin-users";
import { isCurrentlyBanned } from "@/lib/ban";
import { isAdmin, isStaff } from "@/lib/roles";
import {
  banUserSchema,
  userNoteSchema,
  userTargetSchema,
  type BanUserInput,
  type UserNoteInput,
  type UserTargetInput,
} from "@/lib/schemas/admin-users";
import { db } from "@/server/db";
import {
  creatorApplications,
  moderationEvents,
  quizzes,
  sessions,
  userNotes,
  users,
} from "@/server/db/schema";
import { getOptionalUser, type SessionUser } from "@/server/session";
import type { ActionResult } from "@/types/actions";

const DAY = 86_400_000;
const SOMETHING_WRONG = "Something went wrong. Please try again.";
const HIDDEN_REASON = "Hidden while the creator's account is banned.";

type Actor = ActionResult<{ actor: SessionUser }>;

// Moderators and admins
async function getStaffActor(): Promise<Actor> {
  const actor = await getOptionalUser();

  if (!actor || !isStaff(actor.role)) {
    return { ok: false, error: "You don't have access to that." };
  }
  return { ok: true, actor };
}

// Changing roles is for admins only
async function getAdminActor(): Promise<Actor> {
  const actor = await getOptionalUser();

  if (!actor || !isAdmin(actor.role)) {
    return { ok: false, error: "Only admins can change roles." };
  }
  return { ok: true, actor };
}

// The admin area, its counts and every list in it
function refreshAdmin() {
  revalidatePath("/admin", "layout");
}

export async function banUser(
  input: BanUserInput,
): Promise<ActionResult<{ hidden: number }>> {
  const staff = await getStaffActor();
  if (!staff.ok) return staff;
  const { actor } = staff;

  const parsed = banUserSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: `Write a reason of ${BAN_REASON_MIN} to ${BAN_REASON_MAX} characters.`,
    };
  }
  const { userId, reason, days, hideQuizzes } = parsed.data;

  if (userId === actor.id) {
    return { ok: false, error: "You can't ban your own account." };
  }

  try {
    const result = await db.transaction(
      async (tx): Promise<ActionResult<{ hidden: number }>> => {
        const [target] = await tx
          .select({
            role: users.role,
            banned: users.banned,
            banExpires: users.banExpires,
          })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1)
          .for("update");

        if (!target) return { ok: false, error: "That user was not found." };
        if (isStaff(target.role)) {
          return { ok: false, error: "Staff accounts can't be banned." };
        }
        if (isCurrentlyBanned(target.banned, target.banExpires)) {
          return { ok: false, error: "This account is already banned." };
        }

        const now = new Date();
        const expires =
          days === null ? null : new Date(now.getTime() + days * DAY);

        await tx
          .update(users)
          .set({ banned: true, banReason: reason, banExpires: expires })
          .where(eq(users.id, userId));

        // They are signed out right away, on every device
        await tx.delete(sessions).where(eq(sessions.userId, userId));

        let hidden = 0;
        if (hideQuizzes) {
          const suspended = await tx
            .update(quizzes)
            .set({
              status: "SUSPENDED",
              suspendedAt: now,
              suspendedBy: actor.id,
              suspensionReason: HIDDEN_REASON,
            })
            .where(
              and(
                eq(quizzes.userId, userId),
                eq(quizzes.status, "PUBLISHED"),
                isNull(quizzes.deletedAt),
              ),
            )
            .returning({ id: quizzes.id });

          hidden = suspended.length;

          if (hidden > 0) {
            await tx.insert(moderationEvents).values(
              suspended.map((quiz) => ({
                kind: "QUIZ_SUSPENDED" as const,
                actorId: actor.id,
                quizId: quiz.id,
                note: "Hidden because the creator was banned",
              })),
            );
          }
        }

        await tx.insert(moderationEvents).values({
          kind: "USER_BANNED",
          actorId: actor.id,
          userId,
          note: reason,
        });

        return { ok: true, hidden };
      },
    );

    if (result.ok) refreshAdmin();
    return result;
  } catch (error) {
    console.error("banUser failed", error);
    return { ok: false, error: SOMETHING_WRONG };
  }
}

// Lifting a ban does not bring hidden quizzes back
export async function unbanUser(input: UserTargetInput): Promise<ActionResult> {
  const staff = await getStaffActor();
  if (!staff.ok) return staff;
  const { actor } = staff;

  const parsed = userTargetSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "That request was not valid." };
  }
  const { userId } = parsed.data;

  try {
    const result = await db.transaction(async (tx): Promise<ActionResult> => {
      const [target] = await tx
        .select({ banned: users.banned })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1)
        .for("update");

      if (!target) return { ok: false, error: "That user was not found." };
      if (!target.banned) {
        return { ok: false, error: "This account isn't banned." };
      }

      await tx
        .update(users)
        .set({ banned: false, banReason: null, banExpires: null })
        .where(eq(users.id, userId));

      await tx.insert(moderationEvents).values({
        kind: "USER_UNBANNED",
        actorId: actor.id,
        userId,
      });

      return { ok: true };
    });

    if (result.ok) refreshAdmin();
    return result;
  } catch (error) {
    console.error("unbanUser failed", error);
    return { ok: false, error: SOMETHING_WRONG };
  }
}

export async function grantCreator(
  input: UserTargetInput,
): Promise<ActionResult> {
  const admin = await getAdminActor();
  if (!admin.ok) return admin;
  const { actor } = admin;

  const parsed = userTargetSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "That request was not valid." };
  }
  const { userId } = parsed.data;

  if (userId === actor.id) {
    return { ok: false, error: "You can't change your own role." };
  }

  try {
    const result = await db.transaction(async (tx): Promise<ActionResult> => {
      const [target] = await tx
        .select({ role: users.role })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1)
        .for("update");

      if (!target) return { ok: false, error: "That user was not found." };
      if (target.role !== "USER") {
        return { ok: false, error: "Only players can be made creators." };
      }

      const now = new Date();

      await tx
        .update(users)
        .set({ role: "CREATOR" })
        .where(eq(users.id, userId));

      // A pending application would otherwise stay in the queue
      await tx
        .update(creatorApplications)
        .set({ status: "APPROVED", reviewedBy: actor.id, reviewedAt: now })
        .where(
          and(
            eq(creatorApplications.userId, userId),
            eq(creatorApplications.status, "PENDING"),
          ),
        );

      await tx.insert(moderationEvents).values({
        kind: "CREATOR_APPROVED",
        actorId: actor.id,
        userId,
      });

      return { ok: true };
    });

    if (result.ok) refreshAdmin();
    return result;
  } catch (error) {
    console.error("grantCreator failed", error);
    return { ok: false, error: SOMETHING_WRONG };
  }
}

// Their quizzes stay up. Only creating new ones stops.
export async function revokeCreator(
  input: UserTargetInput,
): Promise<ActionResult> {
  const admin = await getAdminActor();
  if (!admin.ok) return admin;
  const { actor } = admin;

  const parsed = userTargetSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "That request was not valid." };
  }
  const { userId } = parsed.data;

  if (userId === actor.id) {
    return { ok: false, error: "You can't change your own role." };
  }

  try {
    const result = await db.transaction(async (tx): Promise<ActionResult> => {
      const [target] = await tx
        .select({ role: users.role })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1)
        .for("update");

      if (!target) return { ok: false, error: "That user was not found." };
      if (target.role !== "CREATOR") {
        return { ok: false, error: "This user isn't a creator." };
      }

      await tx.update(users).set({ role: "USER" }).where(eq(users.id, userId));

      await tx.insert(moderationEvents).values({
        kind: "CREATOR_REVOKED",
        actorId: actor.id,
        userId,
      });

      return { ok: true };
    });

    if (result.ok) refreshAdmin();
    return result;
  } catch (error) {
    console.error("revokeCreator failed", error);
    return { ok: false, error: SOMETHING_WRONG };
  }
}

export async function signOutEverywhere(
  input: UserTargetInput,
): Promise<ActionResult<{ ended: number }>> {
  const staff = await getStaffActor();
  if (!staff.ok) return staff;
  const { actor } = staff;

  const parsed = userTargetSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "That request was not valid." };
  }
  const { userId } = parsed.data;

  if (userId === actor.id) {
    return { ok: false, error: "That would sign you out here too." };
  }

  try {
    const [target] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!target) return { ok: false, error: "That user was not found." };
    if (isStaff(target.role)) {
      return { ok: false, error: "Staff accounts can't be changed from here." };
    }

    const ended = await db
      .delete(sessions)
      .where(eq(sessions.userId, userId))
      .returning({ id: sessions.id });

    refreshAdmin();
    return { ok: true, ended: ended.length };
  } catch (error) {
    console.error("signOutEverywhere failed", error);
    return { ok: false, error: SOMETHING_WRONG };
  }
}

export async function addUserNote(input: UserNoteInput): Promise<ActionResult> {
  const staff = await getStaffActor();
  if (!staff.ok) return staff;

  const parsed = userNoteSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: `Write a note of ${NOTE_MIN} to ${NOTE_MAX} characters.`,
    };
  }
  const { userId, body } = parsed.data;

  try {
    const [target] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!target) return { ok: false, error: "That user was not found." };

    await db
      .insert(userNotes)
      .values({ userId, authorId: staff.actor.id, body });

    refreshAdmin();
    return { ok: true };
  } catch (error) {
    console.error("addUserNote failed", error);
    return { ok: false, error: SOMETHING_WRONG };
  }
}
