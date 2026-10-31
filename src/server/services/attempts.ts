import "server-only";
import { eq, sql } from "drizzle-orm";
import type { Difficulty } from "@/lib/difficulty";
import { isAnswerCorrect } from "@/lib/grading";
import { nextStreak } from "@/lib/streak";
import { calculateXp } from "@/lib/xp";
import {
  attemptAnswers,
  questionOptions,
  questions,
  quizAttempts,
  users,
  xpEvents,
} from "@/server/db/schema";
import type { DbTransaction } from "@/server/db/types";
import { checkAchievements } from "./achievements";

export type FinalizeAttemptInput = {
  attempt: { id: number; userId: number; quizId: number; startedAt: Date };
  quiz: { difficulty: Difficulty; timeLimitSeconds: number | null };
  status: "COMPLETED" | "TIMED_OUT";
  // Final answers by question id. When left out, the saved answers are used.
  answers?: Record<number, number[]>;
  // Milliseconds spent per question id
  timings: Record<number, number>;
  now: Date;
};

async function loadSavedAnswers(
  tx: DbTransaction,
  attemptId: number,
): Promise<Record<number, number[]>> {
  const rows = await tx
    .select({
      questionId: attemptAnswers.questionId,
      selectedOptionIds: attemptAnswers.selectedOptionIds,
    })
    .from(attemptAnswers)
    .where(eq(attemptAnswers.attemptId, attemptId));

  return Object.fromEntries(
    rows.map((row) => [row.questionId, row.selectedOptionIds]),
  );
}

// Scores an attempt and records everything that follows from it, in the
// caller's transaction: answers, XP ledger, streak, totals and achievements.
export async function finalizeAttempt(
  tx: DbTransaction,
  input: FinalizeAttemptInput,
) {
  const { attempt, quiz, status, now } = input;

  const questionRows = await tx
    .select({ id: questions.id })
    .from(questions)
    .where(eq(questions.quizId, attempt.quizId));

  const optionRows = await tx
    .select({
      id: questionOptions.id,
      questionId: questionOptions.questionId,
      isCorrect: questionOptions.isCorrect,
    })
    .from(questionOptions)
    .innerJoin(questions, eq(questions.id, questionOptions.questionId))
    .where(eq(questions.quizId, attempt.quizId));

  const correctByQuestion = new Map<number, number[]>();
  for (const option of optionRows) {
    if (!option.isCorrect) continue;
    const list = correctByQuestion.get(option.questionId) ?? [];
    list.push(option.id);
    correctByQuestion.set(option.questionId, list);
  }

  const finalAnswers =
    input.answers ?? (await loadSavedAnswers(tx, attempt.id));

  // Every question gets a row, answered or not, so review can show them all
  const graded = questionRows.map((question) => {
    const selected = finalAnswers[question.id] ?? [];
    return {
      questionId: question.id,
      selectedOptionIds: selected,
      isCorrect: isAnswerCorrect(
        correctByQuestion.get(question.id) ?? [],
        selected,
      ),
      timeSpentMs: input.timings[question.id] ?? null,
    };
  });

  const total = graded.length;
  const score = graded.filter((answer) => answer.isCorrect).length;
  const percentage = total === 0 ? 0 : Math.round((score / total) * 100);

  // The user row is locked so two finishing attempts can't both extend a streak
  const [user] = await tx
    .select({
      timezone: users.timezone,
      currentStreak: users.currentStreak,
      bestStreak: users.bestStreak,
      lastActivityDate: users.lastActivityDate,
    })
    .from(users)
    .where(eq(users.id, attempt.userId))
    .limit(1)
    .for("update");

  if (!user) throw new Error("User not found");

  const streak = nextStreak({
    lastActivity: user.lastActivityDate,
    current: user.currentStreak,
    now,
    timeZone: user.timezone,
  });

  const xp = calculateXp({
    correct: score,
    total,
    difficulty: quiz.difficulty,
    streakDays: streak,
  });

  const elapsed = Math.max(
    0,
    Math.round((now.getTime() - attempt.startedAt.getTime()) / 1000),
  );
  const timeTaken = quiz.timeLimitSeconds
    ? Math.min(elapsed, quiz.timeLimitSeconds)
    : elapsed;

  await tx
    .update(quizAttempts)
    .set({
      status,
      score,
      percentage,
      timeTaken,
      xpEarned: xp.total,
      completedAt: now,
    })
    .where(eq(quizAttempts.id, attempt.id));

  if (graded.length > 0) {
    await tx
      .insert(attemptAnswers)
      .values(graded.map((answer) => ({ attemptId: attempt.id, ...answer })))
      .onConflictDoUpdate({
        target: [attemptAnswers.attemptId, attemptAnswers.questionId],
        set: {
          selectedOptionIds: sql`excluded.selected_option_ids`,
          isCorrect: sql`excluded.is_correct`,
          timeSpentMs: sql`excluded.time_spent_ms`,
        },
      });
  }

  const ledger: {
    source: "QUIZ_COMPLETED" | "PERFECT_SCORE" | "STREAK_BONUS";
    amount: number;
  }[] = [
    { source: "QUIZ_COMPLETED", amount: xp.base },
    { source: "PERFECT_SCORE", amount: xp.perfect },
    { source: "STREAK_BONUS", amount: xp.streak },
  ];

  const events = ledger
    .filter((entry) => entry.amount > 0)
    .map((entry) => ({
      userId: attempt.userId,
      amount: entry.amount,
      source: entry.source,
      sourceId: attempt.id,
    }));

  if (events.length > 0) await tx.insert(xpEvents).values(events);

  await tx
    .update(users)
    .set({
      totalXp: sql`${users.totalXp} + ${xp.total}`,
      currentStreak: streak,
      bestStreak: Math.max(user.bestStreak, streak),
      lastActivityDate: now,
    })
    .where(eq(users.id, attempt.userId));

  const unlocked = await checkAchievements(tx, attempt.userId);

  return { score, total, percentage, xp, streak, unlocked };
}
