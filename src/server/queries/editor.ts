import "server-only";
import { cache } from "react";
import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/server/db";
import {
  categories,
  questionOptions,
  questions,
  quizTags,
  quizzes,
  tags,
} from "@/server/db/schema";
import type {
  EditableQuiz,
  EditorOption,
  EditorQuestion,
} from "@/types/quiz-editor";
import { ownedQuiz } from "./ownership";

// Cached per request, so the page and its metadata share one lookup
export const getEditableQuiz = cache(
  async (slug: string, userId: number): Promise<EditableQuiz | null> => {
    const [quiz] = await db
      .select({
        id: quizzes.id,
        slug: quizzes.slug,
        title: quizzes.title,
        description: quizzes.description,
        difficulty: quizzes.difficulty,
        status: quizzes.status,
        visibility: quizzes.visibility,
        timeLimitSeconds: quizzes.timeLimitSeconds,
        shuffleQuestions: quizzes.shuffleQuestions,
        shuffleOptions: quizzes.shuffleOptions,
        maxAttempts: quizzes.maxAttempts,
        suspensionReason: quizzes.suspensionReason,
        categorySlug: categories.slug,
      })
      .from(quizzes)
      .innerJoin(categories, eq(categories.id, quizzes.categoryId))
      .where(ownedQuiz(slug, userId))
      .limit(1);

    if (!quiz) return null;

    const [questionRows, tagRows] = await Promise.all([
      db
        .select()
        .from(questions)
        .where(eq(questions.quizId, quiz.id))
        .orderBy(asc(questions.position), asc(questions.id)),
      db
        .select({ name: tags.name })
        .from(quizTags)
        .innerJoin(tags, eq(tags.id, quizTags.tagId))
        .where(eq(quizTags.quizId, quiz.id))
        .orderBy(asc(tags.name)),
    ]);

    const optionRows =
      questionRows.length === 0
        ? []
        : await db
            .select()
            .from(questionOptions)
            .where(
              inArray(
                questionOptions.questionId,
                questionRows.map((question) => question.id),
              ),
            )
            .orderBy(asc(questionOptions.position), asc(questionOptions.id));

    const optionsByQuestion = new Map<number, EditorOption[]>();
    for (const option of optionRows) {
      const list = optionsByQuestion.get(option.questionId) ?? [];
      list.push({
        id: option.id,
        key: `o${option.id}`,
        label: option.label,
        isCorrect: option.isCorrect,
      });
      optionsByQuestion.set(option.questionId, list);
    }

    return {
      slug: quiz.slug,
      status: quiz.status,
      suspensionReason: quiz.suspensionReason,
      settings: {
        title: quiz.title,
        description: quiz.description,
        category: quiz.categorySlug,
        difficulty: quiz.difficulty,
        visibility: quiz.visibility,
        timeLimitMinutes: quiz.timeLimitSeconds
          ? Math.round(quiz.timeLimitSeconds / 60)
          : null,
        shuffleQuestions: quiz.shuffleQuestions,
        shuffleOptions: quiz.shuffleOptions,
        maxAttempts: quiz.maxAttempts,
        tags: tagRows.map((row) => row.name),
      },
      questions: questionRows.map(
        (question): EditorQuestion => ({
          id: question.id,
          key: `q${question.id}`,
          type: question.type,
          title: question.title,
          explanation: question.explanation ?? "",
          options: optionsByQuestion.get(question.id) ?? [],
        }),
      ),
    };
  },
);
