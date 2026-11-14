import "server-only";
import { and, count, eq, inArray, isNull } from "drizzle-orm";
import { canCreateQuizzes } from "@/lib/roles";
import { db } from "@/server/db";
import { moderationEvents, quizzes, users } from "@/server/db/schema";
import type { AdminCreator } from "@/types/admin-quizzes";

// What staff want to know about a creator before they decide on a quiz: who
// they are, how much they publish, and how often they were acted on before
export async function getCreatorFacts(
  ids: number[],
): Promise<Map<number, AdminCreator>> {
  if (ids.length === 0) return new Map();

  const [owners, published, suspensions, bans] = await Promise.all([
    db
      .select({ id: users.id, name: users.name, role: users.role })
      .from(users)
      .where(inArray(users.id, ids)),
    db
      .select({ userId: quizzes.userId, total: count() })
      .from(quizzes)
      .where(
        and(
          inArray(quizzes.userId, ids),
          eq(quizzes.status, "PUBLISHED"),
          isNull(quizzes.deletedAt),
        ),
      )
      .groupBy(quizzes.userId),
    // Earlier actions against their quizzes
    db
      .select({ userId: quizzes.userId, total: count() })
      .from(moderationEvents)
      .innerJoin(quizzes, eq(quizzes.id, moderationEvents.quizId))
      .where(
        and(
          inArray(quizzes.userId, ids),
          inArray(moderationEvents.kind, ["QUIZ_SUSPENDED", "QUIZ_DELETED"]),
        ),
      )
      .groupBy(quizzes.userId),
    // And against the person
    db
      .select({ userId: moderationEvents.userId, total: count() })
      .from(moderationEvents)
      .where(
        and(
          inArray(moderationEvents.userId, ids),
          eq(moderationEvents.kind, "USER_BANNED"),
        ),
      )
      .groupBy(moderationEvents.userId),
  ]);

  const publishedBy = new Map(published.map((row) => [row.userId, row.total]));

  const strikesBy = new Map<number, number>();
  for (const row of [...suspensions, ...bans]) {
    if (row.userId === null) continue;
    strikesBy.set(row.userId, (strikesBy.get(row.userId) ?? 0) + row.total);
  }

  return new Map(
    owners.map((owner) => [
      owner.id,
      {
        id: owner.id,
        name: owner.name,
        former: !canCreateQuizzes(owner.role),
        published: publishedBy.get(owner.id) ?? 0,
        strikes: strikesBy.get(owner.id) ?? 0,
      },
    ]),
  );
}
