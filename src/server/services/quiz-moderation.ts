import "server-only";
import { and, eq } from "drizzle-orm";
import {
  moderationEvents,
  quizReports,
  quizzes,
  type Quiz,
} from "@/server/db/schema";
import type { DbTransaction } from "@/server/db/types";

export type LockedQuiz = Pick<
  Quiz,
  "id" | "status" | "suspendedBy" | "deletedAt"
>;

// A quiz hidden by reports has no person behind the suspension
export function isHiddenAutomatically(quiz: LockedQuiz) {
  return (
    quiz.deletedAt === null &&
    quiz.status === "SUSPENDED" &&
    quiz.suspendedBy === null
  );
}

// The quiz row is locked until the transaction ends, so two staff members
// can't act on the same quiz at once
export async function lockQuiz(
  tx: DbTransaction,
  quizId: number,
): Promise<LockedQuiz | null> {
  const [quiz] = await tx
    .select({
      id: quizzes.id,
      status: quizzes.status,
      suspendedBy: quizzes.suspendedBy,
      deletedAt: quizzes.deletedAt,
    })
    .from(quizzes)
    .where(eq(quizzes.id, quizId))
    .limit(1)
    .for("update");

  return quiz ?? null;
}

// Closes every open report on the quiz and says how many there were
export async function closeReports(
  tx: DbTransaction,
  {
    quizId,
    status,
    actorId,
  }: { quizId: number; status: "DISMISSED" | "ACTIONED"; actorId: number },
) {
  const closed = await tx
    .update(quizReports)
    .set({ status, reviewedBy: actorId, reviewedAt: new Date() })
    .where(and(eq(quizReports.quizId, quizId), eq(quizReports.status, "OPEN")))
    .returning({ id: quizReports.id });

  return closed.length;
}

// The checks come first and the writes after, so a failed check never leaves
// half of a decision behind

export function suspendBlocker(quiz: LockedQuiz) {
  if (quiz.deletedAt) return "That quiz was deleted.";
  if (quiz.status === "PUBLISHED" || isHiddenAutomatically(quiz)) return null;

  return quiz.status === "SUSPENDED"
    ? "This quiz is already suspended."
    : "Only published quizzes can be suspended.";
}

export async function suspendQuiz(
  tx: DbTransaction,
  {
    quiz,
    actorId,
    message,
  }: { quiz: LockedQuiz; actorId: number; message: string },
) {
  await tx
    .update(quizzes)
    .set({
      status: "SUSPENDED",
      suspendedAt: new Date(),
      suspendedBy: actorId,
      suspensionReason: message,
    })
    .where(eq(quizzes.id, quiz.id));

  await tx.insert(moderationEvents).values({
    kind: "QUIZ_SUSPENDED",
    actorId,
    quizId: quiz.id,
    note: message,
  });
}

export function restoreBlocker(quiz: LockedQuiz) {
  if (quiz.deletedAt) return "That quiz was deleted.";
  if (quiz.status !== "SUSPENDED") return "This quiz isn't suspended.";
  return null;
}

export async function restoreQuiz(
  tx: DbTransaction,
  { quiz, actorId, note }: { quiz: LockedQuiz; actorId: number; note?: string },
) {
  await tx
    .update(quizzes)
    .set({
      status: "PUBLISHED",
      suspendedAt: null,
      suspendedBy: null,
      suspensionReason: null,
    })
    .where(eq(quizzes.id, quiz.id));

  await tx.insert(moderationEvents).values({
    kind: "QUIZ_RESTORED",
    actorId,
    quizId: quiz.id,
    note: note ?? null,
  });
}

export function removeBlocker(quiz: LockedQuiz) {
  return quiz.deletedAt ? "That quiz was already deleted." : null;
}

// A soft delete. Players' past results are kept.
export async function removeQuiz(
  tx: DbTransaction,
  { quiz, actorId }: { quiz: LockedQuiz; actorId: number },
) {
  await tx
    .update(quizzes)
    .set({ deletedAt: new Date() })
    .where(eq(quizzes.id, quiz.id));

  await tx.insert(moderationEvents).values({
    kind: "QUIZ_DELETED",
    actorId,
    quizId: quiz.id,
  });
}
