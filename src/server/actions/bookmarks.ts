"use server";

import "server-only";
import { and, eq } from "drizzle-orm";
import {
  setBookmarkSchema,
  type SetBookmarkInput,
} from "@/lib/schemas/bookmark";
import { db } from "@/server/db";
import { quizBookmarks, quizzes } from "@/server/db/schema";
import { reachableByLink } from "@/server/queries/visibility";
import { getOptionalUser } from "@/server/session";
import type { ActionResult } from "@/types/actions";

export async function setBookmark(
  input: SetBookmarkInput,
): Promise<ActionResult> {
  const user = await getOptionalUser();
  if (!user) return { ok: false, error: "Sign in to save quizzes." };

  const parsed = setBookmarkSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "That request was not valid." };
  }
  const { slug, saved } = parsed.data;

  try {
    // Saving needs a quiz people can reach. Removing a save always works.
    const [quiz] = await db
      .select({ id: quizzes.id })
      .from(quizzes)
      .where(
        saved
          ? and(eq(quizzes.slug, slug), reachableByLink)
          : eq(quizzes.slug, slug),
      )
      .limit(1);

    if (!quiz) return { ok: false, error: "That quiz is not available." };

    if (saved) {
      await db
        .insert(quizBookmarks)
        .values({ quizId: quiz.id, userId: user.id })
        .onConflictDoNothing();
    } else {
      await db
        .delete(quizBookmarks)
        .where(
          and(
            eq(quizBookmarks.quizId, quiz.id),
            eq(quizBookmarks.userId, user.id),
          ),
        );
    }

    return { ok: true };
  } catch (error) {
    console.error("setBookmark failed", error);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}
