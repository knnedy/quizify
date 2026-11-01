"use server";

import "server-only";
import { and, asc, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { canCreateQuizzes } from "@/lib/roles";
import {
  manageQuizSchema,
  type ManageQuizInput,
} from "@/lib/schemas/quiz-management";
import { db } from "@/server/db";
import {
  questionOptions,
  questions,
  quizTags,
  quizzes,
} from "@/server/db/schema";
import { ownedQuiz } from "@/server/queries/ownership";
import { uniqueQuizSlug } from "@/server/services/quiz-slug";
import { getOptionalUser, type SessionUser } from "@/server/session";
import type { ActionResult } from "@/types/actions";

// Matches the editor's title limit
const TITLE_MAX_LENGTH = 80;
const COPY_SUFFIX = " (copy)";
const SOMETHING_WRONG = "Something went wrong. Please try again.";

async function getCreator(): Promise<ActionResult<{ user: SessionUser }>> {
  const user = await getOptionalUser();
  if (!user) return { ok: false, error: "Sign in to manage your quizzes." };

  if (!canCreateQuizzes(user.role)) {
    return { ok: false, error: "Only creators can manage quizzes." };
  }

  return { ok: true, user };
}

function copyTitle(title: string) {
  return title.length + COPY_SUFFIX.length > TITLE_MAX_LENGTH
    ? `${title.slice(0, TITLE_MAX_LENGTH - COPY_SUFFIX.length).trimEnd()}${COPY_SUFFIX}`
    : `${title}${COPY_SUFFIX}`;
}

export async function duplicateQuiz(
  input: ManageQuizInput,
): Promise<ActionResult<{ slug: string }>> {
  const creator = await getCreator();
  if (!creator.ok) return creator;
  const { user } = creator;

  const parsed = manageQuizSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "That request was not valid." };
  }

  try {
    const result = await db.transaction(
      async (tx): Promise<ActionResult<{ slug: string }>> => {
        const [original] = await tx
          .select()
          .from(quizzes)
          .where(ownedQuiz(parsed.data.slug, user.id))
          .limit(1);

        if (!original) return { ok: false, error: "That quiz was not found." };
        if (original.status === "SUSPENDED") {
          return { ok: false, error: "A suspended quiz can't be copied." };
        }

        const title = copyTitle(original.title);
        const slug = await uniqueQuizSlug(tx, title);

        const [copy] = await tx
          .insert(quizzes)
          .values({
            userId: user.id,
            categoryId: original.categoryId,
            slug,
            title,
            description: original.description,
            difficulty: original.difficulty,
            status: "DRAFT",
            visibility: original.visibility,
            timeLimitSeconds: original.timeLimitSeconds,
            shuffleQuestions: original.shuffleQuestions,
            shuffleOptions: original.shuffleOptions,
            maxAttempts: original.maxAttempts,
          })
          .returning({ id: quizzes.id });

        if (!copy) throw new Error("The copy was not created");

        const originalQuestions = await tx
          .select()
          .from(questions)
          .where(eq(questions.quizId, original.id))
          .orderBy(asc(questions.position), asc(questions.id));

        if (originalQuestions.length > 0) {
          // Positions are renumbered from 0, so each new question can be
          // matched to its original by position
          const created = await tx
            .insert(questions)
            .values(
              originalQuestions.map((question, index) => ({
                quizId: copy.id,
                type: question.type,
                title: question.title,
                explanation: question.explanation,
                position: index,
                points: question.points,
              })),
            )
            .returning({ id: questions.id, position: questions.position });

          const newIdByPosition = new Map(
            created.map((row) => [row.position, row.id]),
          );

          const originalOptions = await tx
            .select()
            .from(questionOptions)
            .where(
              inArray(
                questionOptions.questionId,
                originalQuestions.map((question) => question.id),
              ),
            )
            .orderBy(asc(questionOptions.position), asc(questionOptions.id));

          const optionsByQuestion = new Map<number, typeof originalOptions>();
          for (const option of originalOptions) {
            const list = optionsByQuestion.get(option.questionId) ?? [];
            list.push(option);
            optionsByQuestion.set(option.questionId, list);
          }

          const copiedOptions = originalQuestions.flatMap((question, index) => {
            const questionId = newIdByPosition.get(index);
            if (questionId === undefined) {
              throw new Error("A copied question is missing");
            }

            return (optionsByQuestion.get(question.id) ?? []).map(
              (option, position) => ({
                questionId,
                label: option.label,
                isCorrect: option.isCorrect,
                position,
              }),
            );
          });

          if (copiedOptions.length > 0) {
            await tx.insert(questionOptions).values(copiedOptions);
          }
        }

        const originalTags = await tx
          .select({ tagId: quizTags.tagId })
          .from(quizTags)
          .where(eq(quizTags.quizId, original.id));

        if (originalTags.length > 0) {
          await tx
            .insert(quizTags)
            .values(
              originalTags.map((tag) => ({
                quizId: copy.id,
                tagId: tag.tagId,
              })),
            );
        }

        return { ok: true, slug };
      },
    );

    if (result.ok) revalidatePath("/my-quizzes");
    return result;
  } catch (error) {
    console.error("duplicateQuiz failed", error);
    return { ok: false, error: SOMETHING_WRONG };
  }
}

export async function archiveQuiz(
  input: ManageQuizInput,
): Promise<ActionResult> {
  const creator = await getCreator();
  if (!creator.ok) return creator;

  const parsed = manageQuizSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "That request was not valid." };
  }

  try {
    const [updated] = await db
      .update(quizzes)
      .set({ status: "ARCHIVED" })
      .where(
        and(
          ownedQuiz(parsed.data.slug, creator.user.id),
          eq(quizzes.status, "PUBLISHED"),
        ),
      )
      .returning({ id: quizzes.id });

    if (!updated) {
      return {
        ok: false,
        error: "Only your published quizzes can be archived.",
      };
    }

    revalidatePath("/my-quizzes");
    return { ok: true };
  } catch (error) {
    console.error("archiveQuiz failed", error);
    return { ok: false, error: SOMETHING_WRONG };
  }
}

export async function deleteQuiz(
  input: ManageQuizInput,
): Promise<ActionResult> {
  const creator = await getCreator();
  if (!creator.ok) return creator;

  const parsed = manageQuizSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "That request was not valid." };
  }

  try {
    const [deleted] = await db
      .update(quizzes)
      .set({ deletedAt: new Date() })
      .where(ownedQuiz(parsed.data.slug, creator.user.id))
      .returning({ id: quizzes.id });

    if (!deleted) return { ok: false, error: "That quiz was not found." };

    revalidatePath("/my-quizzes");
    return { ok: true };
  } catch (error) {
    console.error("deleteQuiz failed", error);
    return { ok: false, error: SOMETHING_WRONG };
  }
}
