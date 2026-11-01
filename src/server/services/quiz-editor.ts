import "server-only";
import { eq, inArray } from "drizzle-orm";
import type { SaveQuizInput } from "@/lib/schemas/quiz-editor";
import { slugify } from "@/lib/slug";
import {
  categories,
  questionOptions,
  questions,
  quizTags,
  quizzes,
  tags,
} from "@/server/db/schema";
import type { DbTransaction } from "@/server/db/types";
import { ownedQuiz } from "@/server/queries/ownership";
import type { ActionResult } from "@/types/actions";
import type { SavedIds } from "@/types/quiz-editor";
import { uniqueQuizSlug } from "./quiz-slug";

type PersistResult = ActionResult<{ slug: string; ids: SavedIds }>;

async function replaceTags(tx: DbTransaction, quizId: number, names: string[]) {
  const bySlug = new Map<string, string>();
  for (const raw of names) {
    const name = raw.trim().toLowerCase();
    const slug = slugify(name);
    if (name && slug && !bySlug.has(slug)) bySlug.set(slug, name);
  }

  await tx.delete(quizTags).where(eq(quizTags.quizId, quizId));
  if (bySlug.size === 0) return;

  await tx
    .insert(tags)
    .values([...bySlug].map(([slug, name]) => ({ slug, name })))
    .onConflictDoNothing();

  const rows = await tx
    .select({ id: tags.id })
    .from(tags)
    .where(inArray(tags.slug, [...bySlug.keys()]));

  await tx
    .insert(quizTags)
    .values(rows.map((row) => ({ quizId, tagId: row.id })));
}

// Writes a quiz and its questions in the caller's transaction. Rows the editor
// already knows are updated by id, so old attempts keep pointing at them.
export async function persistQuiz(
  tx: DbTransaction,
  {
    userId,
    input,
    publish,
  }: { userId: number; input: SaveQuizInput; publish: boolean },
): Promise<PersistResult> {
  const { settings } = input;

  const [category] = await tx
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.slug, settings.category))
    .limit(1);

  if (!category) return { ok: false, error: "That category does not exist." };

  let existing: {
    id: number;
    slug: string;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED" | "SUSPENDED";
    publishedAt: Date | null;
  } | null = null;

  if (input.slug) {
    // Locked, so two saves of the same quiz can't interleave
    const [row] = await tx
      .select({
        id: quizzes.id,
        slug: quizzes.slug,
        status: quizzes.status,
        publishedAt: quizzes.publishedAt,
      })
      .from(quizzes)
      .where(ownedQuiz(input.slug, userId))
      .limit(1)
      .for("update");

    if (!row) return { ok: false, error: "That quiz was not found." };
    existing = row;

    if (publish && row.status === "PUBLISHED") {
      return { ok: false, error: "This quiz is already published." };
    }
    if (publish && row.status === "SUSPENDED") {
      return {
        ok: false,
        error:
          "A suspended quiz can't be published. An admin has to restore it.",
      };
    }
  }

  const now = new Date();
  const fields = {
    categoryId: category.id,
    title: settings.title,
    description: settings.description,
    difficulty: settings.difficulty,
    visibility: settings.visibility,
    timeLimitSeconds:
      settings.timeLimitMinutes === null
        ? null
        : settings.timeLimitMinutes * 60,
    shuffleQuestions: settings.shuffleQuestions,
    shuffleOptions: settings.shuffleOptions,
    maxAttempts: settings.maxAttempts,
  };

  let quizId: number;
  let slug: string;

  if (existing) {
    quizId = existing.id;
    slug = existing.slug;

    await tx
      .update(quizzes)
      .set(
        publish
          ? {
              ...fields,
              status: "PUBLISHED" as const,
              publishedAt: existing.publishedAt ?? now,
            }
          : fields,
      )
      .where(eq(quizzes.id, existing.id));
  } else {
    slug = await uniqueQuizSlug(tx, settings.title);

    const [created] = await tx
      .insert(quizzes)
      .values({
        ...fields,
        userId,
        slug,
        status: publish ? "PUBLISHED" : "DRAFT",
        publishedAt: publish ? now : null,
      })
      .returning({ id: quizzes.id });

    if (!created) throw new Error("The quiz was not created");
    quizId = created.id;
  }

  await replaceTags(tx, quizId, settings.tags);

  // Questions
  const existingQuestions = existing
    ? await tx.select().from(questions).where(eq(questions.quizId, quizId))
    : [];
  const questionById = new Map(
    existingQuestions.map((question) => [question.id, question]),
  );

  const questionIds: Record<string, number> = {};
  const usedQuestionIds = new Set<number>();
  const newQuestions: { position: number; index: number }[] = [];

  for (const [index, question] of input.questions.entries()) {
    const explanation = question.explanation || null;
    const current =
      question.id !== undefined && !usedQuestionIds.has(question.id)
        ? questionById.get(question.id)
        : undefined;

    if (!current) {
      newQuestions.push({ position: index, index });
      continue;
    }

    usedQuestionIds.add(current.id);
    questionIds[question.key] = current.id;

    if (
      current.type !== question.type ||
      current.title !== question.title ||
      current.explanation !== explanation ||
      current.position !== index
    ) {
      await tx
        .update(questions)
        .set({
          type: question.type,
          title: question.title,
          explanation,
          position: index,
        })
        .where(eq(questions.id, current.id));
    }
  }

  const removedQuestionIds = existingQuestions
    .filter((question) => !usedQuestionIds.has(question.id))
    .map((question) => question.id);

  if (removedQuestionIds.length > 0) {
    await tx.delete(questions).where(inArray(questions.id, removedQuestionIds));
  }

  if (newQuestions.length > 0) {
    const created = await tx
      .insert(questions)
      .values(
        newQuestions.map(({ index }) => {
          const question = input.questions[index];
          if (!question) throw new Error("A question is missing");

          return {
            quizId,
            type: question.type,
            title: question.title,
            explanation: question.explanation || null,
            position: index,
          };
        }),
      )
      .returning({ id: questions.id, position: questions.position });

    const idByPosition = new Map(created.map((row) => [row.position, row.id]));

    for (const { index, position } of newQuestions) {
      const question = input.questions[index];
      const id = idByPosition.get(position);
      if (!question || id === undefined) {
        throw new Error("A new question was not created");
      }
      questionIds[question.key] = id;
    }
  }

  // Options
  const existingOptions =
    existingQuestions.length === 0
      ? []
      : await tx
          .select()
          .from(questionOptions)
          .where(
            inArray(
              questionOptions.questionId,
              existingQuestions.map((question) => question.id),
            ),
          );

  const optionsByQuestion = new Map<
    number,
    Map<number, (typeof existingOptions)[number]>
  >();
  for (const option of existingOptions) {
    const group = optionsByQuestion.get(option.questionId) ?? new Map();
    group.set(option.id, option);
    optionsByQuestion.set(option.questionId, group);
  }

  const optionIds: Record<string, number> = {};
  const removedOptionIds: number[] = [];
  const newOptions: {
    key: string;
    questionId: number;
    label: string;
    isCorrect: boolean;
    position: number;
  }[] = [];

  for (const question of input.questions) {
    const questionId = questionIds[question.key];
    if (questionId === undefined) throw new Error("A question has no id");

    const currentOptions = optionsByQuestion.get(questionId);
    const usedOptionIds = new Set<number>();

    for (const [position, option] of question.options.entries()) {
      const current =
        option.id !== undefined && !usedOptionIds.has(option.id)
          ? currentOptions?.get(option.id)
          : undefined;

      if (!current) {
        newOptions.push({
          key: option.key,
          questionId,
          label: option.label,
          isCorrect: option.isCorrect,
          position,
        });
        continue;
      }

      usedOptionIds.add(current.id);
      optionIds[option.key] = current.id;

      if (
        current.label !== option.label ||
        current.isCorrect !== option.isCorrect ||
        current.position !== position
      ) {
        await tx
          .update(questionOptions)
          .set({
            label: option.label,
            isCorrect: option.isCorrect,
            position,
          })
          .where(eq(questionOptions.id, current.id));
      }
    }

    for (const optionId of currentOptions?.keys() ?? []) {
      if (!usedOptionIds.has(optionId)) removedOptionIds.push(optionId);
    }
  }

  if (removedOptionIds.length > 0) {
    await tx
      .delete(questionOptions)
      .where(inArray(questionOptions.id, removedOptionIds));
  }

  if (newOptions.length > 0) {
    const created = await tx
      .insert(questionOptions)
      .values(
        newOptions.map((option) => ({
          questionId: option.questionId,
          label: option.label,
          isCorrect: option.isCorrect,
          position: option.position,
        })),
      )
      .returning({
        id: questionOptions.id,
        questionId: questionOptions.questionId,
        position: questionOptions.position,
      });

    const idByQuestionPosition = new Map(
      created.map((row) => [`${row.questionId}:${row.position}`, row.id]),
    );

    for (const option of newOptions) {
      const id = idByQuestionPosition.get(
        `${option.questionId}:${option.position}`,
      );
      if (id === undefined) throw new Error("A new answer was not created");
      optionIds[option.key] = id;
    }
  }

  return {
    ok: true,
    slug,
    ids: { questions: questionIds, options: optionIds },
  };
}
