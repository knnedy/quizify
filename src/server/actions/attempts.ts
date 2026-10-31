"use server";

import "server-only";
import { and, count, eq } from "drizzle-orm";
import { attemptDeadline, isExpired } from "@/lib/attempt-time";
import { isValidSelection } from "@/lib/grading";
import {
  saveAnswerSchema,
  startAttemptSchema,
  submitAttemptSchema,
  type SaveAnswerInput,
  type StartAttemptInput,
  type SubmitAttemptInput,
} from "@/lib/schemas/attempt";
import { db } from "@/server/db";
import {
  attemptAnswers,
  questionOptions,
  questions,
  quizAttempts,
  quizzes,
} from "@/server/db/schema";
import type { DbTransaction } from "@/server/db/types";
import { finishedAttempt } from "@/server/queries/attempt-filters";
import { reachableByLink } from "@/server/queries/visibility";
import { finalizeAttempt } from "@/server/services/attempts";
import { getOptionalUser } from "@/server/session";
import type { ActionResult } from "@/types/actions";
import type { QuestionType } from "@/types/play";

// A submit this close to the deadline still counts as on time
const SUBMIT_GRACE_MS = 5_000;

const SOMETHING_WRONG = "Something went wrong. Please try again.";

// Every question of a quiz with the ids of its options, for checking answers
async function loadStructure(tx: DbTransaction, quizId: number) {
  const rows = await tx
    .select({
      questionId: questions.id,
      type: questions.type,
      optionId: questionOptions.id,
    })
    .from(questions)
    .innerJoin(questionOptions, eq(questionOptions.questionId, questions.id))
    .where(eq(questions.quizId, quizId));

  const structure = new Map<
    number,
    { type: QuestionType; optionIds: Set<number> }
  >();

  for (const row of rows) {
    const entry = structure.get(row.questionId) ?? {
      type: row.type,
      optionIds: new Set<number>(),
    };
    entry.optionIds.add(row.optionId);
    structure.set(row.questionId, entry);
  }

  return structure;
}

export async function startAttempt(
  input: StartAttemptInput,
): Promise<ActionResult> {
  const user = await getOptionalUser();
  if (!user) return { ok: false, error: "Sign in to play." };

  const parsed = startAttemptSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "That request was not valid." };
  }

  try {
    return await db.transaction(async (tx): Promise<ActionResult> => {
      const [quiz] = await tx
        .select({
          id: quizzes.id,
          difficulty: quizzes.difficulty,
          timeLimitSeconds: quizzes.timeLimitSeconds,
          maxAttempts: quizzes.maxAttempts,
        })
        .from(quizzes)
        .where(and(eq(quizzes.slug, parsed.data.slug), reachableByLink))
        .limit(1);

      if (!quiz) return { ok: false, error: "That quiz is not available." };

      const [active] = await tx
        .select({
          id: quizAttempts.id,
          userId: quizAttempts.userId,
          quizId: quizAttempts.quizId,
          startedAt: quizAttempts.startedAt,
        })
        .from(quizAttempts)
        .where(
          and(
            eq(quizAttempts.quizId, quiz.id),
            eq(quizAttempts.userId, user.id),
            eq(quizAttempts.status, "IN_PROGRESS"),
          ),
        )
        .limit(1)
        .for("update");

      if (active) {
        // Resuming is free
        if (!isExpired(active.startedAt, quiz.timeLimitSeconds)) {
          return { ok: true };
        }

        // The old attempt ran out of time while the player was away
        await finalizeAttempt(tx, {
          attempt: active,
          quiz,
          status: "TIMED_OUT",
          timings: {},
          now: new Date(),
        });
      }

      if (quiz.maxAttempts !== null) {
        const [used] = await tx
          .select({ total: count() })
          .from(quizAttempts)
          .where(
            and(
              eq(quizAttempts.quizId, quiz.id),
              eq(quizAttempts.userId, user.id),
              finishedAttempt,
            ),
          );

        if ((used?.total ?? 0) >= quiz.maxAttempts) {
          return {
            ok: false,
            error: `You have used all ${quiz.maxAttempts} attempts for this quiz.`,
          };
        }
      }

      // The start time comes from the app clock. The column default depends on
      // the database time zone.
      await tx
        .insert(quizAttempts)
        .values({ quizId: quiz.id, userId: user.id, startedAt: new Date() })
        .onConflictDoNothing();

      return { ok: true };
    });
  } catch (error) {
    console.error("startAttempt failed", error);
    return { ok: false, error: SOMETHING_WRONG };
  }
}

export async function saveAnswer(
  input: SaveAnswerInput,
): Promise<ActionResult> {
  const user = await getOptionalUser();
  if (!user) return { ok: false, error: "Sign in to play." };

  const parsed = saveAnswerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "That answer was not valid." };
  }
  const { attemptId, questionId, optionIds } = parsed.data;

  try {
    return await db.transaction(async (tx): Promise<ActionResult> => {
      // The attempt row is locked so a save can't land during scoring
      const [attempt] = await tx
        .select({
          id: quizAttempts.id,
          quizId: quizAttempts.quizId,
          status: quizAttempts.status,
          startedAt: quizAttempts.startedAt,
        })
        .from(quizAttempts)
        .where(
          and(eq(quizAttempts.id, attemptId), eq(quizAttempts.userId, user.id)),
        )
        .limit(1)
        .for("update");

      if (!attempt) return { ok: false, error: "That attempt was not found." };

      if (attempt.status !== "IN_PROGRESS") {
        return {
          ok: false,
          error: "This attempt is already finished.",
          code: "FINISHED",
        };
      }

      const [quiz] = await tx
        .select({ timeLimitSeconds: quizzes.timeLimitSeconds })
        .from(quizzes)
        .where(eq(quizzes.id, attempt.quizId))
        .limit(1);

      if (isExpired(attempt.startedAt, quiz?.timeLimitSeconds ?? null)) {
        return { ok: false, error: "Time is up.", code: "EXPIRED" };
      }

      const structure = await loadStructure(tx, attempt.quizId);
      const question = structure.get(questionId);

      if (
        !question ||
        !isValidSelection(question.type, optionIds, question.optionIds)
      ) {
        return { ok: false, error: "That answer was not valid." };
      }

      if (optionIds.length === 0) {
        await tx
          .delete(attemptAnswers)
          .where(
            and(
              eq(attemptAnswers.attemptId, attemptId),
              eq(attemptAnswers.questionId, questionId),
            ),
          );
        return { ok: true };
      }

      // isCorrect is a placeholder until the attempt is scored
      await tx
        .insert(attemptAnswers)
        .values({
          attemptId,
          questionId,
          selectedOptionIds: optionIds,
          isCorrect: false,
        })
        .onConflictDoUpdate({
          target: [attemptAnswers.attemptId, attemptAnswers.questionId],
          set: { selectedOptionIds: optionIds },
        });

      return { ok: true };
    });
  } catch (error) {
    console.error("saveAnswer failed", error);
    return { ok: false, error: SOMETHING_WRONG };
  }
}

export async function submitAttempt(
  input: SubmitAttemptInput,
): Promise<ActionResult> {
  const user = await getOptionalUser();
  if (!user) return { ok: false, error: "Sign in to play." };

  const parsed = submitAttemptSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Those answers were not valid." };
  }
  const { attemptId, timeout, answers, timings } = parsed.data;

  try {
    return await db.transaction(async (tx): Promise<ActionResult> => {
      const [attempt] = await tx
        .select({
          id: quizAttempts.id,
          userId: quizAttempts.userId,
          quizId: quizAttempts.quizId,
          status: quizAttempts.status,
          startedAt: quizAttempts.startedAt,
        })
        .from(quizAttempts)
        .where(
          and(eq(quizAttempts.id, attemptId), eq(quizAttempts.userId, user.id)),
        )
        .limit(1)
        .for("update");

      if (!attempt) return { ok: false, error: "That attempt was not found." };

      // Already scored, for example by a second tab: send the player on
      if (attempt.status !== "IN_PROGRESS") return { ok: true };

      const [quiz] = await tx
        .select({
          difficulty: quizzes.difficulty,
          timeLimitSeconds: quizzes.timeLimitSeconds,
        })
        .from(quizzes)
        .where(eq(quizzes.id, attempt.quizId))
        .limit(1);

      if (!quiz) return { ok: false, error: "That quiz is not available." };

      const now = new Date();
      const deadline = attemptDeadline(
        attempt.startedAt,
        quiz.timeLimitSeconds,
      );
      const late =
        deadline !== null &&
        now.getTime() > deadline.getTime() + SUBMIT_GRACE_MS;
      const timedOut =
        late ||
        (timeout &&
          deadline !== null &&
          now.getTime() >= deadline.getTime() - SUBMIT_GRACE_MS);

      // Answers sent after the deadline do not count. Only what was saved in
      // time is scored.
      let finalAnswers: Record<number, number[]> | undefined;

      if (!late) {
        const structure = await loadStructure(tx, attempt.quizId);
        finalAnswers = {};

        for (const [key, optionIds] of Object.entries(answers)) {
          const questionId = Number(key);
          const question = structure.get(questionId);

          if (
            !question ||
            !isValidSelection(question.type, optionIds, question.optionIds)
          ) {
            return { ok: false, error: "One of your answers was not valid." };
          }

          if (optionIds.length > 0) finalAnswers[questionId] = optionIds;
        }
      }

      await finalizeAttempt(tx, {
        attempt,
        quiz,
        status: timedOut ? "TIMED_OUT" : "COMPLETED",
        answers: finalAnswers,
        timings: Object.fromEntries(
          Object.entries(timings).map(([key, ms]) => [Number(key), ms]),
        ),
        now,
      });

      return { ok: true };
    });
  } catch (error) {
    console.error("submitAttempt failed", error);
    return { ok: false, error: SOMETHING_WRONG };
  }
}
