"use server";

import "server-only";
import { APIError } from "better-auth/api";
import { and, eq, inArray, isNull, or } from "drizzle-orm";
import { headers } from "next/headers";
import {
  changePasswordSchema,
  deleteAccountSchema,
  type ChangePasswordInput,
  type DeleteAccountInput,
} from "@/lib/schemas/settings";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { quizzes, users } from "@/server/db/schema";
import { getOptionalUser } from "@/server/session";
import type { ActionResult } from "@/types/actions";

const SOMETHING_WRONG = "Something went wrong. Please try again.";

export async function changePassword(
  input: ChangePasswordInput,
): Promise<ActionResult> {
  const user = await getOptionalUser();
  if (!user) return { ok: false, error: "Sign in to change your password." };

  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Check your passwords.",
    };
  }

  try {
    await auth.api.changePassword({
      body: parsed.data,
      headers: await headers(),
    });
    return { ok: true };
  } catch (error) {
    // The input was already checked, so what is left is a wrong current
    // password
    if (error instanceof APIError) {
      return { ok: false, error: "Your current password isn't right." };
    }

    console.error("changePassword failed", error);
    return { ok: false, error: SOMETHING_WRONG };
  }
}

export async function deleteAccount(
  input: DeleteAccountInput,
): Promise<ActionResult> {
  const user = await getOptionalUser();
  if (!user) return { ok: false, error: "Sign in to delete your account." };

  const parsed = deleteAccountSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Type the confirmation word to continue." };
  }

  try {
    return await db.transaction(async (tx): Promise<ActionResult> => {
      // The site must always keep one admin
      if (user.role === "ADMIN") {
        const admins = await tx
          .select({ id: users.id })
          .from(users)
          .where(eq(users.role, "ADMIN"))
          .for("update");

        if (admins.length <= 1) {
          return {
            ok: false,
            error:
              "You are the only admin. Make someone else an admin before deleting your account.",
          };
        }
      }

      // Quizzes nobody could reach without an owner go away with the account.
      // Public and unlisted published quizzes stay, credited to a former
      // member.
      await tx
        .update(quizzes)
        .set({ deletedAt: new Date() })
        .where(
          and(
            eq(quizzes.userId, user.id),
            isNull(quizzes.deletedAt),
            or(
              inArray(quizzes.status, ["DRAFT", "ARCHIVED"]),
              eq(quizzes.visibility, "PRIVATE"),
            ),
          ),
        );

      // Sessions, progress, ratings and the rest follow through the cascades
      await tx.delete(users).where(eq(users.id, user.id));

      return { ok: true };
    });
  } catch (error) {
    console.error("deleteAccount failed", error);
    return { ok: false, error: SOMETHING_WRONG };
  }
}
