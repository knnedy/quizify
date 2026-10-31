import "server-only";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { quizzes } from "@/server/db/schema";

// Public lists show published, public quizzes that are not deleted.
// Suspended quizzes are excluded by the status check.
export const publiclyListed = and(
  eq(quizzes.status, "PUBLISHED"),
  eq(quizzes.visibility, "PUBLIC"),
  isNull(quizzes.deletedAt),
);

// Direct links also allow unlisted quizzes.
export const reachableByLink = and(
  eq(quizzes.status, "PUBLISHED"),
  inArray(quizzes.visibility, ["PUBLIC", "UNLISTED"]),
  isNull(quizzes.deletedAt),
);
