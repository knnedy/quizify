import "server-only";
import { and, eq, isNull } from "drizzle-orm";
import { quizzes } from "@/server/db/schema";

// A quiz the user created and has not deleted
export function ownedQuiz(slug: string, userId: number) {
  return and(
    eq(quizzes.slug, slug),
    eq(quizzes.userId, userId),
    isNull(quizzes.deletedAt),
  );
}
