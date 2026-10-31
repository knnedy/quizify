import "server-only";
import { and, asc, eq, inArray } from "drizzle-orm";
import { remainingSeconds } from "@/lib/attempt-time";
import { seededShuffle } from "@/lib/shuffle";
import { db } from "@/server/db";
import {
  attemptAnswers,
  questionOptions,
  questions,
  quizAttempts,
  quizzes,
} from "@/server/db/schema";
import type { PlayOption, PlayQuestion, PlayQuiz } from "@/types/play";
import { reachableByLink } from "./visibility";

export type PlaySessionResult =
  | { status: "not-found" }
  | { status: "no-attempt" }
  | { status: "ready"; quiz: PlayQuiz };

export async function getPlaySession(
  slug: string,
  userId: number,
): Promise<PlaySessionResult> {
  const [quiz] = await db
    .select({
      id: quizzes.id,
      slug: quizzes.slug,
      title: quizzes.title,
      timeLimitSeconds: quizzes.timeLimitSeconds,
      shuffleQuestions: quizzes.shuffleQuestions,
      shuffleOptions: quizzes.shuffleOptions,
    })
    .from(quizzes)
    .where(and(eq(quizzes.slug, slug), reachableByLink))
    .limit(1);

  if (!quiz) return { status: "not-found" };

  const [attempt] = await db
    .select({
      id: quizAttempts.id,
      startedAt: quizAttempts.startedAt,
      shuffleSeed: quizAttempts.shuffleSeed,
    })
    .from(quizAttempts)
    .where(
      and(
        eq(quizAttempts.quizId, quiz.id),
        eq(quizAttempts.userId, userId),
        eq(quizAttempts.status, "IN_PROGRESS"),
      ),
    )
    .limit(1);

  if (!attempt) return { status: "no-attempt" };

  const questionRows = await db
    .select({
      id: questions.id,
      type: questions.type,
      title: questions.title,
    })
    .from(questions)
    .where(eq(questions.quizId, quiz.id))
    .orderBy(asc(questions.position), asc(questions.id));

  const [optionRows, answerRows] = await Promise.all([
    db
      .select({
        id: questionOptions.id,
        questionId: questionOptions.questionId,
        label: questionOptions.label,
      })
      .from(questionOptions)
      .where(
        inArray(
          questionOptions.questionId,
          questionRows.map((question) => question.id),
        ),
      )
      .orderBy(asc(questionOptions.position), asc(questionOptions.id)),
    db
      .select({
        questionId: attemptAnswers.questionId,
        selectedOptionIds: attemptAnswers.selectedOptionIds,
      })
      .from(attemptAnswers)
      .where(eq(attemptAnswers.attemptId, attempt.id)),
  ]);

  const optionsByQuestion = new Map<number, PlayOption[]>();
  for (const option of optionRows) {
    const list = optionsByQuestion.get(option.questionId) ?? [];
    list.push({ id: option.id, label: option.label });
    optionsByQuestion.set(option.questionId, list);
  }

  const built = questionRows.map((question): PlayQuestion => {
    const options = optionsByQuestion.get(question.id) ?? [];

    return {
      id: question.id,
      type: question.type,
      title: question.title,
      options:
        quiz.shuffleOptions && question.type !== "TRUE_FALSE"
          ? seededShuffle(options, attempt.shuffleSeed + question.id)
          : options,
    };
  });

  const answers: Record<number, number[]> = Object.fromEntries(
    answerRows
      .filter((row) => row.selectedOptionIds.length > 0)
      .map((row) => [row.questionId, row.selectedOptionIds]),
  );

  return {
    status: "ready",
    quiz: {
      attemptId: attempt.id,
      slug: quiz.slug,
      title: quiz.title,
      timeLimitSeconds: quiz.timeLimitSeconds,
      secondsRemaining: remainingSeconds(
        attempt.startedAt,
        quiz.timeLimitSeconds,
      ),
      questions: quiz.shuffleQuestions
        ? seededShuffle(built, attempt.shuffleSeed)
        : built,
      answers,
    },
  };
}
