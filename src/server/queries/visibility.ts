import "server-only";
import { and, eq, inArray, isNull, or } from "drizzle-orm";
import { quizzes } from "@/server/db/schema";

// Public lists show published, public quizzes that are not deleted.
// Suspended quizzes are excluded by the status check.
export const publiclyListed = and(
  eq(quizzes.status, "PUBLISHED"),
  eq(quizzes.visibility, "PUBLIC"),
  isNull(quizzes.deletedAt),
);

// Quizzes a person can open directly: published and not deleted, and either
// shareable (public or unlisted) or their own. Without a viewer, only the
// shareable ones.
export function reachableBy(viewerId?: number) {
  const shareable = inArray(quizzes.visibility, ["PUBLIC", "UNLISTED"]);

  return and(
    eq(quizzes.status, "PUBLISHED"),
    isNull(quizzes.deletedAt),
    viewerId === undefined
      ? shareable
      : or(shareable, eq(quizzes.userId, viewerId)),
  );
}

// For actions where the owner is never allowed anyway, such as rating or
// reporting a quiz
export const reachableByLink = reachableBy();
