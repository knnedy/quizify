import "server-only";
import { and, asc, count, eq, inArray } from "drizzle-orm";
import { arrangeQuestions } from "@/lib/shuffle";
import { db } from "@/server/db";
import {
  attemptAnswers,
  questionOptions,
  questions,
  quizAttempts,
  quizzes,
} from "@/server/db/schema";
import type {
  QuizReview,
  ReviewOption,
  ReviewQuestion,
  ReviewStatus,
} from "@/types/review";
import { finishedAttempt } from "./attempt-filters";
import { getLatestFinishedAttempt } from "./attempts";
import { reachableByLink } from "./visibility";

export type QuizReviewOutcome =
  | { status: "not-found" }
  | { status: "no-attempt" }
  | { status: "ready"; review: QuizReview };

type DraftQuestion = Omit<ReviewQuestion, "number">;

// The player's latest finished attempt, question by question. Only questions
// that were graded in that attempt are shown.
export async function getQuizReview(
  slug: string,
  userId: number,
): Promise<QuizReviewOutcome> {
  const [quiz] = await db
    .select({
      id: quizzes.id,
      slug: quizzes.slug,
      title: quizzes.title,
      maxAttempts: quizzes.maxAttempts,
      shuffleQuestions: quizzes.shuffleQuestions,
      shuffleOptions: quizzes.shuffleOptions,
    })
    .from(quizzes)
    .where(and(eq(quizzes.slug, slug), reachableByLink))
    .limit(1);

  if (!quiz) return { status: "not-found" };

  const attempt = await getLatestFinishedAttempt(quiz.id, userId);
  if (!attempt) return { status: "no-attempt" };

  const [answerRows, usedRows] = await Promise.all([
    db
      .select({
        questionId: questions.id,
        type: questions.type,
        title: questions.title,
        explanation: questions.explanation,
        selectedOptionIds: attemptAnswers.selectedOptionIds,
        isCorrect: attemptAnswers.isCorrect,
        timeSpentMs: attemptAnswers.timeSpentMs,
      })
      .from(attemptAnswers)
      .innerJoin(questions, eq(questions.id, attemptAnswers.questionId))
      .where(eq(attemptAnswers.attemptId, attempt.id))
      .orderBy(asc(questions.position), asc(questions.id)),
    db
      .select({ total: count() })
      .from(quizAttempts)
      .where(
        and(
          eq(quizAttempts.quizId, quiz.id),
          eq(quizAttempts.userId, userId),
          finishedAttempt,
        ),
      ),
  ]);

  const optionRows =
    answerRows.length === 0
      ? []
      : await db
          .select({
            id: questionOptions.id,
            questionId: questionOptions.questionId,
            label: questionOptions.label,
            isCorrect: questionOptions.isCorrect,
          })
          .from(questionOptions)
          .where(
            inArray(
              questionOptions.questionId,
              answerRows.map((row) => row.questionId),
            ),
          )
          .orderBy(asc(questionOptions.position), asc(questionOptions.id));

  const selectedByQuestion = new Map(
    answerRows.map((row) => [row.questionId, new Set(row.selectedOptionIds)]),
  );

  const optionsByQuestion = new Map<number, ReviewOption[]>();
  for (const option of optionRows) {
    const list = optionsByQuestion.get(option.questionId) ?? [];
    list.push({
      id: option.id,
      label: option.label,
      isCorrect: option.isCorrect,
      isSelected:
        selectedByQuestion.get(option.questionId)?.has(option.id) ?? false,
    });
    optionsByQuestion.set(option.questionId, list);
  }

  const drafts = answerRows.map((row): DraftQuestion => {
    const answered = row.selectedOptionIds.length > 0;
    const status: ReviewStatus = !answered
      ? "skipped"
      : row.isCorrect
        ? "correct"
        : "incorrect";

    return {
      id: row.questionId,
      type: row.type,
      title: row.title,
      explanation: row.explanation,
      status,
      timeSpentSeconds:
        answered && row.timeSpentMs !== null
          ? Math.max(1, Math.round(row.timeSpentMs / 1000))
          : null,
      options: optionsByQuestion.get(row.questionId) ?? [],
    };
  });

  const reviewQuestions: ReviewQuestion[] = arrangeQuestions(drafts, {
    shuffleQuestions: quiz.shuffleQuestions,
    shuffleOptions: quiz.shuffleOptions,
    seed: attempt.shuffleSeed,
  }).map((question, index) => ({ ...question, number: index + 1 }));

  const used = usedRows[0]?.total ?? 0;

  return {
    status: "ready",
    review: {
      slug: quiz.slug,
      title: quiz.title,
      status: attempt.status === "TIMED_OUT" ? "TIMED_OUT" : "COMPLETED",
      score: attempt.score,
      total: reviewQuestions.length,
      answered: drafts.filter((question) => question.status !== "skipped")
        .length,
      percentage: attempt.percentage,
      canPlayAgain: quiz.maxAttempts === null || used < quiz.maxAttempts,
      questions: reviewQuestions,
    },
  };
}
