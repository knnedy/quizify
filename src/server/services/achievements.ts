import "server-only";
import { and, count, eq, isNull, sql } from "drizzle-orm";
import {
  achievements,
  quizAttempts,
  quizzes,
  userAchievements,
  users,
  xpEvents,
  type Achievement,
} from "@/server/db/schema";
import type { DbTransaction } from "@/server/db/types";
import { finishedAttempt } from "@/server/queries/attempt-filters";

export type UnlockedAchievement = {
  id: number;
  key: string;
  title: string;
  description: string;
  xpReward: number;
};

type Metrics = Record<Achievement["type"], number>;

// An achievement reward can itself unlock a total XP achievement, so the check
// repeats a few times until nothing new unlocks
const MAX_PASSES = 3;

async function loadMetrics(
  tx: DbTransaction,
  userId: number,
): Promise<Metrics> {
  const [attempts] = await tx
    .select({
      completed: sql<number>`count(distinct ${quizAttempts.quizId})::int`,
      perfect: sql<number>`(count(distinct ${quizAttempts.quizId}) filter (where ${quizAttempts.percentage} = 100))::int`,
    })
    .from(quizAttempts)
    .where(and(eq(quizAttempts.userId, userId), finishedAttempt));

  const [created] = await tx
    .select({ total: count() })
    .from(quizzes)
    .where(
      and(
        eq(quizzes.userId, userId),
        eq(quizzes.status, "PUBLISHED"),
        isNull(quizzes.deletedAt),
      ),
    );

  const [user] = await tx
    .select({ totalXp: users.totalXp, bestStreak: users.bestStreak })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return {
    QUIZZES_COMPLETED: attempts?.completed ?? 0,
    PERFECT_SCORES: attempts?.perfect ?? 0,
    QUIZZES_CREATED: created?.total ?? 0,
    STREAK_DAYS: user?.bestStreak ?? 0,
    TOTAL_XP: user?.totalXp ?? 0,
  };
}

export async function checkAchievements(
  tx: DbTransaction,
  userId: number,
): Promise<UnlockedAchievement[]> {
  const catalog = await tx.select().from(achievements);
  const unlocked: UnlockedAchievement[] = [];

  for (let pass = 0; pass < MAX_PASSES; pass++) {
    const metrics = await loadMetrics(tx, userId);
    const states = await tx
      .select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId));

    const finished = new Set(
      states.filter((state) => state.isCompleted).map((s) => s.achievementId),
    );
    const savedProgress = new Map(
      states.map((state) => [state.achievementId, state.progress]),
    );

    const newlyUnlocked: Achievement[] = [];

    for (const achievement of catalog) {
      if (finished.has(achievement.id)) continue;

      const value = metrics[achievement.type];
      const completed = value >= achievement.threshold;
      const progress = Math.min(value, achievement.threshold);

      if (!completed && progress === (savedProgress.get(achievement.id) ?? 0)) {
        continue;
      }

      const completedAt = completed ? new Date() : null;

      await tx
        .insert(userAchievements)
        .values({
          userId,
          achievementId: achievement.id,
          progress,
          isCompleted: completed,
          completedAt,
        })
        .onConflictDoUpdate({
          target: [userAchievements.userId, userAchievements.achievementId],
          set: { progress, isCompleted: completed, completedAt },
        });

      if (completed) newlyUnlocked.push(achievement);
    }

    if (newlyUnlocked.length === 0) break;

    const rewarded = newlyUnlocked.filter((item) => item.xpReward > 0);
    if (rewarded.length > 0) {
      await tx.insert(xpEvents).values(
        rewarded.map((item) => ({
          userId,
          amount: item.xpReward,
          source: "ACHIEVEMENT" as const,
          sourceId: item.id,
        })),
      );

      const reward = rewarded.reduce((sum, item) => sum + item.xpReward, 0);
      await tx
        .update(users)
        .set({ totalXp: sql`${users.totalXp} + ${reward}` })
        .where(eq(users.id, userId));
    }

    unlocked.push(
      ...newlyUnlocked.map((item) => ({
        id: item.id,
        key: item.key,
        title: item.title,
        description: item.description,
        xpReward: item.xpReward,
      })),
    );
  }

  return unlocked;
}
