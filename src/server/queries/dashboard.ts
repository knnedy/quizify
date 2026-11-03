import "server-only";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  inArray,
  isNull,
  sql,
} from "drizzle-orm";
import { isExpired, remainingSeconds } from "@/lib/attempt-time";
import { CREATOR_REQUIRED_QUIZZES } from "@/lib/creator-rules";
import { canCreateQuizzes } from "@/lib/roles";
import { activeStreak, calendarDaysAgo, dayKey, lastDays } from "@/lib/streak";
import { db } from "@/server/db";
import {
  achievements,
  attemptAnswers,
  categories,
  questions,
  quizAttempts,
  quizBookmarks,
  quizzes,
  userAchievements,
  users,
  type Achievement as AchievementRow,
} from "@/server/db/schema";
import type { SessionUser } from "@/server/session";
import type {
  Achievement,
  Dashboard,
  InProgress,
  PlayerStats,
  RecentResult,
  SavedQuiz,
  Streak,
  TopicScore,
} from "@/types/dashboard";
import { finishedAttempt } from "./attempt-filters";
import { getCreatorOverview } from "./creator-dashboard";
import { listQuizzes } from "./quizzes";
import { reachableBy } from "./visibility";

const DAY = 86_400_000;
const RECENT_LIMIT = 5;
const SAVED_LIMIT = 4;
const PICKS_LIMIT = 3;

const weekday = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  timeZone: "UTC",
});

type Metrics = Record<AchievementRow["type"], number>;

async function loadProfile(userId: number) {
  const [row] = await db
    .select({
      timezone: users.timezone,
      totalXp: users.totalXp,
      currentStreak: users.currentStreak,
      bestStreak: users.bestStreak,
      lastActivityDate: users.lastActivityDate,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return row ?? null;
}

async function loadStats(userId: number, since: Date) {
  const [row] = await db
    .select({
      attempts: sql<number>`count(*)::int`,
      completed: sql<number>`count(distinct ${quizAttempts.quizId})::int`,
      perfect: sql<number>`(count(distinct ${quizAttempts.quizId}) filter (where ${quizAttempts.percentage} = 100))::int`,
      average: sql<number | null>`round(avg(${quizAttempts.percentage}))::int`,
      thisWeek: sql<number>`(count(*) filter (where ${gte(quizAttempts.completedAt, since)}))::int`,
    })
    .from(quizAttempts)
    .where(and(eq(quizAttempts.userId, userId), finishedAttempt));

  return {
    attempts: row?.attempts ?? 0,
    completed: row?.completed ?? 0,
    perfect: row?.perfect ?? 0,
    average: row?.average ?? null,
    thisWeek: row?.thisWeek ?? 0,
  };
}

// The days in the last week on which the player finished a quiz
async function loadActivityDays(userId: number, timeZone: string, now: Date) {
  const rows = await db
    .select({ completedAt: quizAttempts.completedAt })
    .from(quizAttempts)
    .where(
      and(
        eq(quizAttempts.userId, userId),
        finishedAttempt,
        gte(quizAttempts.completedAt, new Date(now.getTime() - 9 * DAY)),
      ),
    );

  const days = new Set<string>();
  for (const row of rows) {
    if (row.completedAt) days.add(dayKey(row.completedAt, timeZone));
  }
  return days;
}

async function loadInProgress(
  userId: number,
  now: Date,
): Promise<InProgress | null> {
  const rows = await db
    .select({
      attemptId: quizAttempts.id,
      startedAt: quizAttempts.startedAt,
      quizId: quizzes.id,
      slug: quizzes.slug,
      title: quizzes.title,
      timeLimitSeconds: quizzes.timeLimitSeconds,
    })
    .from(quizAttempts)
    .innerJoin(quizzes, eq(quizzes.id, quizAttempts.quizId))
    .where(
      and(
        eq(quizAttempts.userId, userId),
        eq(quizAttempts.status, "IN_PROGRESS"),
        reachableBy(userId),
      ),
    )
    .orderBy(desc(quizAttempts.startedAt))
    .limit(5);

  // An attempt that ran out of time can't be resumed
  const live = rows.find(
    (row) => !isExpired(row.startedAt, row.timeLimitSeconds, now),
  );
  if (!live) return null;

  const [answered, total] = await Promise.all([
    db
      .select({ total: count() })
      .from(attemptAnswers)
      .where(
        and(
          eq(attemptAnswers.attemptId, live.attemptId),
          sql`cardinality(${attemptAnswers.selectedOptionIds}) > 0`,
        ),
      ),
    db
      .select({ total: count() })
      .from(questions)
      .where(eq(questions.quizId, live.quizId)),
  ]);

  return {
    slug: live.slug,
    title: live.title,
    answered: answered[0]?.total ?? 0,
    total: total[0]?.total ?? 0,
    secondsLeft: remainingSeconds(live.startedAt, live.timeLimitSeconds, now),
  };
}

// The latest attempt on each quiz, newest first
async function loadRecent(
  userId: number,
  timeZone: string,
  now: Date,
): Promise<RecentResult[]> {
  const rows = await db
    .select({
      attemptId: quizAttempts.id,
      slug: quizzes.slug,
      title: quizzes.title,
      score: quizAttempts.score,
      percentage: quizAttempts.percentage,
      xp: quizAttempts.xpEarned,
      completedAt: quizAttempts.completedAt,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(quizAttempts)
    .innerJoin(quizzes, eq(quizzes.id, quizAttempts.quizId))
    .innerJoin(categories, eq(categories.id, quizzes.categoryId))
    .where(
      and(
        eq(quizAttempts.userId, userId),
        finishedAttempt,
        reachableBy(userId),
      ),
    )
    .orderBy(
      sql`${quizAttempts.completedAt} desc nulls last`,
      desc(quizAttempts.id),
    )
    .limit(30);

  const seen = new Set<string>();
  const latest = [];
  for (const row of rows) {
    if (seen.has(row.slug)) continue;
    seen.add(row.slug);
    latest.push(row);
    if (latest.length === RECENT_LIMIT) break;
  }

  if (latest.length === 0) return [];

  const totals = await db
    .select({ attemptId: attemptAnswers.attemptId, total: count() })
    .from(attemptAnswers)
    .where(
      inArray(
        attemptAnswers.attemptId,
        latest.map((row) => row.attemptId),
      ),
    )
    .groupBy(attemptAnswers.attemptId);

  const totalByAttempt = new Map(totals.map((r) => [r.attemptId, r.total]));

  return latest.map((row) => ({
    slug: row.slug,
    title: row.title,
    category: { name: row.categoryName, slug: row.categorySlug },
    score: row.score,
    total: totalByAttempt.get(row.attemptId) ?? 0,
    percentage: row.percentage,
    daysAgo: calendarDaysAgo(row.completedAt ?? now, now, timeZone),
    xp: row.xp,
  }));
}

async function loadTopics(userId: number): Promise<TopicScore[]> {
  const rows = await db
    .select({
      slug: categories.slug,
      name: categories.name,
      plays: sql<number>`count(distinct ${quizAttempts.quizId})::int`,
      average: sql<number>`round(avg(${quizAttempts.percentage}))::int`,
    })
    .from(quizAttempts)
    .innerJoin(quizzes, eq(quizzes.id, quizAttempts.quizId))
    .innerJoin(categories, eq(categories.id, quizzes.categoryId))
    .where(and(eq(quizAttempts.userId, userId), finishedAttempt))
    .groupBy(categories.id)
    .orderBy(
      desc(sql`count(distinct ${quizAttempts.quizId})`),
      asc(categories.name),
    )
    .limit(5);

  return rows.map((row) => ({
    slug: row.slug,
    name: row.name,
    plays: row.plays,
    averagePercentage: row.average,
  }));
}

async function loadAchievements(
  userId: number,
  canCreate: boolean,
  metrics: Metrics,
): Promise<Achievement[]> {
  const [catalog, states] = await Promise.all([
    db.select().from(achievements).orderBy(asc(achievements.id)),
    db
      .select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId)),
  ]);

  const unlocked = new Set(
    states.filter((state) => state.isCompleted).map((s) => s.achievementId),
  );

  return catalog
    .filter((item) => canCreate || item.type !== "QUIZZES_CREATED")
    .flatMap((item): Achievement[] => {
      const value = metrics[item.type];
      // An unlock is permanent, even if the number later drops
      const completed = unlocked.has(item.id) || value >= item.threshold;

      if (item.isHidden && !completed) return [];

      return [
        {
          key: item.key,
          title: item.title,
          description: item.description,
          progress: completed
            ? item.threshold
            : Math.min(value, item.threshold),
          threshold: item.threshold,
          xpReward: item.xpReward,
          completed,
        },
      ];
    });
}

async function countPublishedQuizzes(userId: number) {
  const [row] = await db
    .select({ total: count() })
    .from(quizzes)
    .where(
      and(
        eq(quizzes.userId, userId),
        eq(quizzes.status, "PUBLISHED"),
        isNull(quizzes.deletedAt),
      ),
    );

  return row?.total ?? 0;
}

// Bookmarked quizzes the player can still open, newest bookmark first
async function loadSaved(userId: number): Promise<SavedQuiz[]> {
  const rows = await db
    .select({
      slug: quizzes.slug,
      title: quizzes.title,
      difficulty: quizzes.difficulty,
      categoryName: categories.name,
      categorySlug: categories.slug,
      questions: count(questions.id),
    })
    .from(quizBookmarks)
    .innerJoin(quizzes, eq(quizzes.id, quizBookmarks.quizId))
    .innerJoin(categories, eq(categories.id, quizzes.categoryId))
    .leftJoin(questions, eq(questions.quizId, quizzes.id))
    .where(and(eq(quizBookmarks.userId, userId), reachableBy(userId)))
    .groupBy(quizzes.id, categories.id, quizBookmarks.createdAt)
    .orderBy(desc(quizBookmarks.createdAt))
    .limit(SAVED_LIMIT);

  return rows.map((row) => ({
    slug: row.slug,
    title: row.title,
    difficulty: row.difficulty,
    questions: row.questions,
    category: { name: row.categoryName, slug: row.categorySlug },
  }));
}

function buildStreak(
  profile: NonNullable<Awaited<ReturnType<typeof loadProfile>>>,
  played: Set<string>,
  now: Date,
): Streak {
  const keys = lastDays(now, profile.timezone, 7);
  const today = keys[keys.length - 1];

  const current = activeStreak({
    lastActivity: profile.lastActivityDate,
    current: profile.currentStreak,
    now,
    timeZone: profile.timezone,
  });

  return {
    current,
    best: Math.max(profile.bestStreak, current),
    playedToday: played.has(today),
    days: keys.map((key) => ({
      label: weekday.format(new Date(`${key}T00:00:00Z`)),
      played: played.has(key),
      today: key === today,
    })),
  };
}

export async function getDashboard(
  user: SessionUser,
): Promise<Dashboard | null> {
  const now = new Date();
  const canCreate = canCreateQuizzes(user.role);

  const profile = await loadProfile(user.id);
  if (!profile) return null;

  const stats = await loadStats(user.id, new Date(now.getTime() - 7 * DAY));
  const isNew = stats.attempts === 0;
  const unplayed = { unplayedBy: user.id, viewerId: user.id };

  const [
    played,
    inProgress,
    recent,
    topics,
    saved,
    created,
    candidates,
    creator,
  ] = await Promise.all([
    loadActivityDays(user.id, profile.timezone, now),
    loadInProgress(user.id, now),
    loadRecent(user.id, profile.timezone, now),
    loadTopics(user.id),
    loadSaved(user.id),
    canCreate ? countPublishedQuizzes(user.id) : Promise.resolve(0),
    // New players start with beginner quizzes, and fall back to anything
    (async () => {
      if (isNew) {
        const beginner = await listQuizzes({
          difficulty: "BEGINNER",
          sort: "popular",
          pageSize: 8,
          ...unplayed,
        });
        if (beginner.items.length > 0) return beginner.items;
      }

      const popular = await listQuizzes({
        sort: "popular",
        pageSize: 12,
        ...unplayed,
      });
      return popular.items;
    })(),
    canCreate
      ? getCreatorOverview(user.id, profile.timezone, now)
      : Promise.resolve(null),
  ]);

  const achievementsList = await loadAchievements(user.id, canCreate, {
    QUIZZES_COMPLETED: stats.completed,
    PERFECT_SCORES: stats.perfect,
    STREAK_DAYS: profile.bestStreak,
    TOTAL_XP: profile.totalXp,
    QUIZZES_CREATED: created,
  });

  // The player's most played topics come first. The quiz they are in the
  // middle of is never suggested.
  const favourite = new Set(topics.slice(0, 3).map((topic) => topic.slug));
  const pool = candidates.filter((quiz) => quiz.slug !== inProgress?.slug);
  const ordered = [
    ...pool.filter((quiz) => favourite.has(quiz.category.slug)),
    ...pool.filter((quiz) => !favourite.has(quiz.category.slug)),
  ];

  const suggestion = inProgress ? null : (ordered[0] ?? null);
  const picked = (inProgress ? ordered : ordered.slice(1)).slice(
    0,
    PICKS_LIMIT,
  );

  const playerStats: PlayerStats = {
    completed: stats.completed,
    thisWeek: stats.thisWeek,
    averagePercentage: stats.average,
    totalXp: profile.totalXp,
    perfectScores: stats.perfect,
  };

  return {
    firstName: user.name.split(" ")[0] ?? user.name,
    isNew,
    isCreator: canCreate,
    totalXp: profile.totalXp,
    streak: buildStreak(profile, played, now),
    stats: playerStats,
    inProgress,
    suggestion,
    recent,
    topics,
    achievements: achievementsList,
    saved,
    picks: isNew
      ? {
          title: "Good first quizzes",
          text: "Beginner friendly and popular with new players.",
          quizzes: picked,
        }
      : {
          title: "Picked for you",
          text: "Based on the topics you play most.",
          quizzes: picked,
        },
    eligibility: {
      completed: stats.completed,
      required: CREATOR_REQUIRED_QUIZZES,
    },
    creator,
  };
}
