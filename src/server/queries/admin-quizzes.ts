import "server-only";
import { cache } from "react";
import { and, asc, count, desc, eq, inArray, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "@/server/db";
import {
  categories,
  moderationEvents,
  questionOptions,
  questions,
  quizAttempts,
  quizReports,
  quizTags,
  quizzes,
  tags,
  users,
} from "@/server/db/schema";
import type {
  AdminQuizPreview,
  Moderation,
  PreviewOption,
  PreviewQuestion,
  PreviewReport,
} from "@/types/admin-quizzes";
import { finishedAttempt } from "./attempt-filters";
import { getCreatorFacts } from "./creator-facts";

const DAY = 86_400_000;

const reporter = alias(users, "preview_reporter");
const suspender = alias(users, "preview_suspender");
const deleter = alias(users, "preview_deleter");

// Who deleted the quiz, when staff did. A quiz its creator deleted has no
// event.
async function loadDeletion(quizId: number) {
  const [row] = await db
    .select({ by: deleter.name })
    .from(moderationEvents)
    .leftJoin(deleter, eq(deleter.id, moderationEvents.actorId))
    .where(
      and(
        eq(moderationEvents.quizId, quizId),
        eq(moderationEvents.kind, "QUIZ_DELETED"),
      ),
    )
    .orderBy(desc(moderationEvents.createdAt), desc(moderationEvents.id))
    .limit(1);

  return row ?? null;
}

type ModerationInput = {
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED" | "SUSPENDED";
  suspendedBy: number | null;
  suspendedAt: Date | null;
  suspensionReason: string | null;
  suspenderName: string | null;
  deletedAt: Date | null;
};

function moderationOf(
  quiz: ModerationInput,
  deletion: { by: string | null } | null,
): Moderation {
  if (quiz.deletedAt) {
    return {
      status: "DELETED",
      note: null,
      by: deletion ? (deletion.by ?? "a former staff member") : "the creator",
      at: quiz.deletedAt,
    };
  }

  if (quiz.status === "SUSPENDED") {
    // No person behind the suspension means the reports hid it
    if (quiz.suspendedBy === null) {
      return { status: "HIDDEN", note: null, by: null, at: quiz.suspendedAt };
    }

    return {
      status: "SUSPENDED",
      note: quiz.suspensionReason,
      by: quiz.suspenderName ?? "a former staff member",
      at: quiz.suspendedAt,
    };
  }

  if (quiz.status === "PUBLISHED") {
    return { status: "PUBLISHED", note: null, by: null, at: null };
  }

  return { status: "UNPUBLISHED", note: null, by: null, at: null };
}

// Staff see every question with its correct answers. Cached per request, so
// the page and its title share one lookup.
//
// Staff can open a quiz that was published at some point, or that has reports.
// A draft nobody has seen stays private to its creator, and so does a deleted
// or private quiz that nobody reported.
export const getAdminQuiz = cache(
  async (slug: string): Promise<AdminQuizPreview | null> => {
    const now = new Date();

    const [quiz] = await db
      .select({
        id: quizzes.id,
        slug: quizzes.slug,
        title: quizzes.title,
        description: quizzes.description,
        difficulty: quizzes.difficulty,
        visibility: quizzes.visibility,
        status: quizzes.status,
        timeLimitSeconds: quizzes.timeLimitSeconds,
        shuffleQuestions: quizzes.shuffleQuestions,
        shuffleOptions: quizzes.shuffleOptions,
        maxAttempts: quizzes.maxAttempts,
        publishedAt: quizzes.publishedAt,
        suspendedAt: quizzes.suspendedAt,
        suspendedBy: quizzes.suspendedBy,
        suspensionReason: quizzes.suspensionReason,
        deletedAt: quizzes.deletedAt,
        ownerId: quizzes.userId,
        categoryName: categories.name,
        categorySlug: categories.slug,
        suspenderName: suspender.name,
      })
      .from(quizzes)
      .innerJoin(categories, eq(categories.id, quizzes.categoryId))
      .leftJoin(suspender, eq(suspender.id, quizzes.suspendedBy))
      .where(eq(quizzes.slug, slug))
      .limit(1);

    if (!quiz) return null;

    const [reportRows, questionRows, tagRows, playRows, deletion, creators] =
      await Promise.all([
        db
          .select({
            id: quizReports.id,
            status: quizReports.status,
            reason: quizReports.reason,
            details: quizReports.details,
            createdAt: quizReports.createdAt,
            reporterId: quizReports.reporterId,
            reporterName: reporter.name,
          })
          .from(quizReports)
          .innerJoin(reporter, eq(reporter.id, quizReports.reporterId))
          .where(eq(quizReports.quizId, quiz.id))
          .orderBy(desc(quizReports.createdAt), desc(quizReports.id)),
        db
          .select({
            id: questions.id,
            type: questions.type,
            title: questions.title,
            explanation: questions.explanation,
          })
          .from(questions)
          .where(eq(questions.quizId, quiz.id))
          .orderBy(asc(questions.position), asc(questions.id)),
        db
          .select({ name: tags.name })
          .from(quizTags)
          .innerJoin(tags, eq(tags.id, quizTags.tagId))
          .where(eq(quizTags.quizId, quiz.id))
          .orderBy(asc(tags.name)),
        db
          .select({ total: count() })
          .from(quizAttempts)
          .where(and(eq(quizAttempts.quizId, quiz.id), finishedAttempt)),
        quiz.deletedAt ? loadDeletion(quiz.id) : Promise.resolve(null),
        getCreatorFacts(quiz.ownerId === null ? [] : [quiz.ownerId]),
      ]);

    const hasReports = reportRows.length > 0;
    if (quiz.publishedAt === null && !hasReports) return null;
    if (quiz.deletedAt && !hasReports) return null;
    if (quiz.visibility === "PRIVATE" && !hasReports) return null;

    const reporterIds = [...new Set(reportRows.map((row) => row.reporterId))];

    const [optionRows, completedRows] = await Promise.all([
      questionRows.length === 0
        ? Promise.resolve([])
        : db
            .select({
              questionId: questionOptions.questionId,
              label: questionOptions.label,
              isCorrect: questionOptions.isCorrect,
            })
            .from(questionOptions)
            .where(
              inArray(
                questionOptions.questionId,
                questionRows.map((question) => question.id),
              ),
            )
            .orderBy(asc(questionOptions.position), asc(questionOptions.id)),
      reporterIds.length === 0
        ? Promise.resolve([])
        : db
            .select({
              userId: quizAttempts.userId,
              total: sql<number>`count(distinct ${quizAttempts.quizId})::int`,
            })
            .from(quizAttempts)
            .where(
              and(inArray(quizAttempts.userId, reporterIds), finishedAttempt),
            )
            .groupBy(quizAttempts.userId),
    ]);

    const optionsByQuestion = new Map<number, PreviewOption[]>();
    for (const option of optionRows) {
      const list = optionsByQuestion.get(option.questionId) ?? [];
      list.push({ label: option.label, isCorrect: option.isCorrect });
      optionsByQuestion.set(option.questionId, list);
    }

    const completedBy = new Map(completedRows.map((r) => [r.userId, r.total]));

    const previewQuestions = questionRows.map(
      (question, index): PreviewQuestion => ({
        number: index + 1,
        type: question.type,
        title: question.title,
        explanation: question.explanation,
        options: optionsByQuestion.get(question.id) ?? [],
      }),
    );

    const reports = reportRows.map(
      (row): PreviewReport => ({
        id: row.id,
        status: row.status,
        reporter: {
          name: row.reporterName,
          completed: completedBy.get(row.reporterId) ?? 0,
        },
        reason: row.reason,
        details: row.details,
        daysAgo: Math.max(
          0,
          Math.floor((now.getTime() - row.createdAt.getTime()) / DAY),
        ),
      }),
    );

    return {
      id: quiz.id,
      slug: quiz.slug,
      title: quiz.title,
      description: quiz.description,
      category: { name: quiz.categoryName, slug: quiz.categorySlug },
      creator:
        quiz.ownerId === null ? null : (creators.get(quiz.ownerId) ?? null),
      difficulty: quiz.difficulty,
      visibility: quiz.visibility,
      timeLimitMinutes: quiz.timeLimitSeconds
        ? Math.round(quiz.timeLimitSeconds / 60)
        : null,
      shuffleQuestions: quiz.shuffleQuestions,
      shuffleOptions: quiz.shuffleOptions,
      maxAttempts: quiz.maxAttempts,
      tags: tagRows.map((row) => row.name),
      publishedDaysAgo: quiz.publishedAt
        ? Math.max(
            0,
            Math.floor((now.getTime() - quiz.publishedAt.getTime()) / DAY),
          )
        : null,
      plays: playRows[0]?.total ?? 0,
      questions: previewQuestions,
      reports,
      moderation: moderationOf(quiz, deletion),
    };
  },
);
