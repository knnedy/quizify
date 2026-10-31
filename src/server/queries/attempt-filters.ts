import "server-only";
import { inArray } from "drizzle-orm";
import { quizAttempts } from "@/server/db/schema";

// A finished attempt is one that produced a result
export const finishedAttempt = inArray(quizAttempts.status, [
  "COMPLETED",
  "TIMED_OUT",
]);
