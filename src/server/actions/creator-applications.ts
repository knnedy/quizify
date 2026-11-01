"use server";

import "server-only";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  APPLICATION_MAX_LENGTH,
  APPLICATION_MIN_LENGTH,
  CREATOR_REQUIRED_QUIZZES,
  reapplyDate,
} from "@/lib/creator-rules";
import { formatDate } from "@/lib/format-date";
import { canCreateQuizzes } from "@/lib/roles";
import {
  applyCreatorSchema,
  type ApplyCreatorInput,
} from "@/lib/schemas/creator";
import { db } from "@/server/db";
import { creatorApplications } from "@/server/db/schema";
import { getCompletedQuizCount } from "@/server/queries/progress";
import { getOptionalUser } from "@/server/session";
import type { ActionResult } from "@/types/actions";

export async function applyToCreate(
  input: ApplyCreatorInput,
): Promise<ActionResult> {
  const user = await getOptionalUser();
  if (!user) return { ok: false, error: "Sign in to apply." };

  if (canCreateQuizzes(user.role)) {
    return { ok: false, error: "You can already create quizzes." };
  }

  const parsed = applyCreatorSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: `Write between ${APPLICATION_MIN_LENGTH} and ${APPLICATION_MAX_LENGTH} characters.`,
    };
  }

  try {
    const completed = await getCompletedQuizCount(user.id);
    if (completed < CREATOR_REQUIRED_QUIZZES) {
      return {
        ok: false,
        error: `Finish ${CREATOR_REQUIRED_QUIZZES} quizzes before applying.`,
      };
    }

    const [latest] = await db
      .select({
        status: creatorApplications.status,
        createdAt: creatorApplications.createdAt,
        reviewedAt: creatorApplications.reviewedAt,
      })
      .from(creatorApplications)
      .where(eq(creatorApplications.userId, user.id))
      .orderBy(
        desc(creatorApplications.createdAt),
        desc(creatorApplications.id),
      )
      .limit(1);

    if (latest?.status === "REJECTED") {
      const next = reapplyDate(latest.reviewedAt ?? latest.createdAt);
      if (next.getTime() > Date.now()) {
        return {
          ok: false,
          error: `You can apply again on ${formatDate(next)}.`,
        };
      }
    }

    // The one pending application per person is enforced by a unique index
    const inserted = await db
      .insert(creatorApplications)
      .values({ userId: user.id, motivation: parsed.data.motivation })
      .onConflictDoNothing()
      .returning({ id: creatorApplications.id });

    if (inserted.length === 0) {
      return { ok: false, error: "You already have an application in review." };
    }

    revalidatePath("/my-quizzes");
    return { ok: true };
  } catch (error) {
    console.error("applyToCreate failed", error);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}
