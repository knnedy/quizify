"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import type { ZodError } from "zod";
import { collectIssues, limits } from "@/lib/quiz-editor-rules";
import { canCreateQuizzes } from "@/lib/roles";
import { saveQuizSchema } from "@/lib/schemas/quiz-editor";
import { db } from "@/server/db";
import { checkAchievements } from "@/server/services/achievements";
import { persistQuiz } from "@/server/services/quiz-editor";
import { getOptionalUser } from "@/server/session";
import type { ActionResult } from "@/types/actions";
import type { SavedIds, SaveQuizPayload } from "@/types/quiz-editor";

type SaveResult = ActionResult<{ slug: string; ids: SavedIds }>;

function describeInvalid(error: ZodError) {
  const [section, field] = error.issues[0]?.path ?? [];

  if (section === "settings" && field === "title") {
    return `Give your quiz a title of at least ${limits.titleMin} characters.`;
  }
  if (section === "settings" && field === "category") {
    return "Pick a category first.";
  }
  return "Some of the content is too long or not valid.";
}

async function persist(
  payload: SaveQuizPayload,
  publish: boolean,
): Promise<SaveResult> {
  const user = await getOptionalUser();
  if (!user) return { ok: false, error: "Sign in to edit quizzes." };

  if (!canCreateQuizzes(user.role)) {
    return { ok: false, error: "Only creators can edit quizzes." };
  }

  const parsed = saveQuizSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: describeInvalid(parsed.error) };
  }

  // The same checks the editor runs before it lets you press Publish
  if (publish) {
    const [issue] = collectIssues(parsed.data.settings, parsed.data.questions);
    if (issue) return { ok: false, error: issue.message };
  }

  try {
    const result = await db.transaction(async (tx) => {
      const saved = await persistQuiz(tx, {
        userId: user.id,
        input: parsed.data,
        publish,
      });

      // Publishing can unlock the achievement for quizzes created
      if (saved.ok && publish) await checkAchievements(tx, user.id);

      return saved;
    });

    if (result.ok) revalidatePath("/my-quizzes");
    return result;
  } catch (error) {
    console.error("saving a quiz failed", error);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

export async function saveQuiz(payload: SaveQuizPayload) {
  return persist(payload, false);
}

export async function publishQuiz(payload: SaveQuizPayload) {
  return persist(payload, true);
}
