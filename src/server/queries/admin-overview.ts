import "server-only";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  inArray,
  isNotNull,
  isNull,
  lte,
  min,
  ne,
  sql,
} from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { DayPoint } from "@/lib/admin-metrics";
import { lastDays } from "@/lib/streak";
import { db } from "@/server/db";
import {
  categories,
  creatorApplications,
  moderationEvents,
  quizAttempts,
  quizReports,
  quizzes,
  users,
} from "@/server/db/schema";
import type {
  ActivityEntry,
  AttentionItem,
  LibrarySlice,
  Overview,
  TopicRow,
  TotalItem,
} from "@/types/admin-overview";
import { getUserSummary } from "./admin-users";
import { finishedAttempt } from "./attempt-filters";
import { listQuizzes } from "./quizzes";

const DAY = 86_400_000;
const SERIES_DAYS = 180;
const ACTIVITY_LIMIT = 8;
const TOP_QUIZZES = 5;
// Beyond a long period, a late application stops being a surprise
const URGENT_AFTER_DAYS = 5;

function plural(total: number, word: string) {
  return `${total} ${total === 1 ? word : `${word}s`}`;
}

function daysSince(date: Date, now: Date) {
  return Math.max(0, Math.floor((now.getTime() - date.getTime()) / DAY));
}

// What is waiting for staff, and how long it has been waiting
async function loadAttention(now: Date, includeApplications: boolean) {
  const weekAhead = new Date(now.getTime() + 7 * DAY);

  const [pendingRows, oldestRows, reportRows, banRows] = await Promise.all([
    includeApplications
      ? db
          .select({ total: count() })
          .from(creatorApplications)
          .where(eq(creatorApplications.status, "PENDING"))
      : Promise.resolve([] as { total: number }[]),
    includeApplications
      ? db
          .select({ at: creatorApplications.createdAt })
          .from(creatorApplications)
          .where(eq(creatorApplications.status, "PENDING"))
          .orderBy(asc(creatorApplications.createdAt))
          .limit(1)
      : Promise.resolve([] as { at: Date }[]),
    // One row per quiz with open reports. A quiz its creator already deleted
    // has nothing left to decide.
    db
      .select({
        status: quizzes.status,
        suspendedBy: quizzes.suspendedBy,
        oldest: min(quizReports.createdAt),
      })
      .from(quizReports)
      .innerJoin(quizzes, eq(quizzes.id, quizReports.quizId))
      .where(and(eq(quizReports.status, "OPEN"), isNull(quizzes.deletedAt)))
      .groupBy(quizReports.quizId, quizzes.status, quizzes.suspendedBy),
    db
      .select({ expires: users.banExpires })
      .from(users)
      .where(
        and(
          eq(users.banned, true),
          gt(users.banExpires, now),
          lte(users.banExpires, weekAhead),
        ),
      )
      .orderBy(asc(users.banExpires)),
  ]);

  const items: AttentionItem[] = [];

  const pending = pendingRows[0]?.total ?? 0;
  if (includeApplications) {
    const oldest = oldestRows[0]?.at;
    const longestWait = oldest ? daysSince(oldest, now) : 0;

    items.push({
      key: "applications",
      label: "Creator applications",
      count: pending,
      note:
        pending === 0
          ? "Nothing waiting"
          : longestWait === 0
            ? "All applied today"
            : `Longest wait: ${plural(longestWait, "day")}`,
      cta: "Review applications",
      href: "/applications",
      tone:
        pending === 0
          ? "clear"
          : longestWait >= URGENT_AFTER_DAYS
            ? "urgent"
            : "normal",
    });
  }

  const openQuizzes = reportRows.length;
  // A quiz hidden by the reports has no person behind its suspension
  const hidden = reportRows.filter(
    (row) => row.status === "SUSPENDED" && row.suspendedBy === null,
  ).length;

  let oldestReport: Date | null = null;
  for (const row of reportRows) {
    if (row.oldest && (!oldestReport || row.oldest < oldestReport)) {
      oldestReport = row.oldest;
    }
  }
  const oldestReportDays = oldestReport ? daysSince(oldestReport, now) : 0;

  items.push({
    key: "reports",
    label: "Open reports",
    count: openQuizzes,
    note:
      openQuizzes === 0
        ? "Nothing to review"
        : hidden > 0
          ? `${hidden} hidden from players`
          : `Oldest: ${oldestReportDays === 0 ? "today" : plural(oldestReportDays, "day")}`,
    cta: "Open the queue",
    href: "/reports",
    tone: openQuizzes === 0 ? "clear" : hidden > 0 ? "urgent" : "normal",
  });

  const nextBan = banRows[0]?.expires;
  const nextBanDays = nextBan
    ? Math.max(0, Math.ceil((nextBan.getTime() - now.getTime()) / DAY))
    : 0;

  items.push({
    key: "bans",
    label: "Bans ending this week",
    count: banRows.length,
    note:
      banRows.length === 0
        ? "No bans ending soon"
        : `Next one ends in ${plural(nextBanDays, "day")}`,
    cta: "See banned users",
    href: "/users?filter=banned",
    tone: banRows.length === 0 ? "clear" : "normal",
  });

  return { items, pending };
}

// Every quiz that isn't deleted, by status
async function loadLibrary(): Promise<LibrarySlice[]> {
  const rows = await db
    .select({ status: quizzes.status, total: count() })
    .from(quizzes)
    .where(isNull(quizzes.deletedAt))
    .groupBy(quizzes.status);

  const byStatus = new Map(rows.map((row) => [row.status, row.total]));

  return [
    {
      key: "published",
      label: "Published",
      count: byStatus.get("PUBLISHED") ?? 0,
    },
    { key: "drafts", label: "Drafts", count: byStatus.get("DRAFT") ?? 0 },
    {
      key: "archived",
      label: "Archived",
      count: byStatus.get("ARCHIVED") ?? 0,
    },
    {
      key: "suspended",
      label: "Suspended or hidden",
      count: byStatus.get("SUSPENDED") ?? 0,
    },
  ];
}

// Plays count every finished attempt, even on quizzes deleted since, so the
// topics add up to the total
async function loadTopics(): Promise<TopicRow[]> {
  const [playRows, quizRows] = await Promise.all([
    db
      .select({ slug: categories.slug, plays: count() })
      .from(quizAttempts)
      .innerJoin(quizzes, eq(quizzes.id, quizAttempts.quizId))
      .innerJoin(categories, eq(categories.id, quizzes.categoryId))
      .where(finishedAttempt)
      .groupBy(categories.id),
    db
      .select({
        slug: categories.slug,
        name: categories.name,
        quizzes: count(quizzes.id),
      })
      .from(categories)
      .leftJoin(
        quizzes,
        and(
          eq(quizzes.categoryId, categories.id),
          eq(quizzes.status, "PUBLISHED"),
          isNull(quizzes.deletedAt),
        ),
      )
      .groupBy(categories.id),
  ]);

  const playsBySlug = new Map(playRows.map((row) => [row.slug, row.plays]));

  return quizRows
    .map(
      (row): TopicRow => ({
        slug: row.slug,
        name: row.name,
        plays: playsBySlug.get(row.slug) ?? 0,
        quizzes: row.quizzes,
      }),
    )
    .filter((topic) => topic.plays > 0 || topic.quizzes > 0)
    .sort((a, b) => b.plays - a.plays || a.name.localeCompare(b.name));
}

// Six months of days in the staff member's own time zone, so the chart can
// show 90 days next to the 90 before
async function loadDays(now: Date, timeZone: string): Promise<DayPoint[]> {
  const since = new Date(now.getTime() - (SERIES_DAYS + 3) * DAY);

  const playDay = sql<string>`to_char((${quizAttempts.completedAt} at time zone 'UTC') at time zone ${timeZone}, 'YYYY-MM-DD')`;
  const signupDay = sql<string>`to_char((${users.createdAt} at time zone 'UTC') at time zone ${timeZone}, 'YYYY-MM-DD')`;

  const [attemptRows, signupRows] = await Promise.all([
    db
      .select({
        day: playDay.as("day"),
        plays: sql<number>`count(*)::int`,
        players: sql<number>`count(distinct ${quizAttempts.userId})::int`,
        scoreSum: sql<number>`coalesce(sum(${quizAttempts.percentage}), 0)::int`,
      })
      .from(quizAttempts)
      .where(and(finishedAttempt, gte(quizAttempts.completedAt, since)))
      .groupBy(sql`"day"`),
    db
      .select({
        day: signupDay.as("day"),
        signups: sql<number>`count(*)::int`,
      })
      .from(users)
      .where(gte(users.createdAt, since))
      .groupBy(sql`"day"`),
  ]);

  const attempts = new Map(attemptRows.map((row) => [row.day, row]));
  const signups = new Map(signupRows.map((row) => [row.day, row.signups]));

  const keys = lastDays(now, timeZone, SERIES_DAYS);

  const daily = keys.map((key) => {
    const row = attempts.get(key);
    return row && row.plays > 0 ? row.scoreSum / row.plays : null;
  });

  // On a day nobody played, the score carries over from the day before. Days
  // before the first play take the first known value.
  let carried = daily.find((value): value is number => value !== null) ?? 0;

  return keys.map((key, index): DayPoint => {
    const row = attempts.get(key);
    const score = daily[index];
    if (score !== null && score !== undefined) carried = score;

    return {
      date: `${key}T00:00:00.000Z`,
      plays: row?.plays ?? 0,
      players: row?.players ?? 0,
      signups: signups.get(key) ?? 0,
      score: Math.round(carried * 10) / 10,
      scoreSum: row?.scoreSum ?? 0,
    };
  });
}

type FeedItem = {
  at: Date;
  entry: Omit<ActivityEntry, "id" | "minutesAgo">;
};

// The latest things that happened, from the real records. Every entry links
// to a page staff can open.
async function loadActivity(
  now: Date,
  includeApplications: boolean,
): Promise<ActivityEntry[]> {
  const applicant = alias(users, "overview_applicant");
  const reporter = alias(users, "overview_reporter");
  const author = alias(users, "overview_author");
  const actor = alias(users, "overview_actor");
  const target = alias(users, "overview_target");

  const [applications, reports, published, events] = await Promise.all([
    includeApplications
      ? db
          .select({ name: applicant.name, at: creatorApplications.createdAt })
          .from(creatorApplications)
          .innerJoin(applicant, eq(applicant.id, creatorApplications.userId))
          .orderBy(
            desc(creatorApplications.createdAt),
            desc(creatorApplications.id),
          )
          .limit(ACTIVITY_LIMIT)
      : Promise.resolve([] as { name: string; at: Date }[]),
    db
      .select({
        name: reporter.name,
        title: quizzes.title,
        slug: quizzes.slug,
        at: quizReports.createdAt,
      })
      .from(quizReports)
      .innerJoin(reporter, eq(reporter.id, quizReports.reporterId))
      .innerJoin(quizzes, eq(quizzes.id, quizReports.quizId))
      .orderBy(desc(quizReports.createdAt), desc(quizReports.id))
      .limit(ACTIVITY_LIMIT),
    db
      .select({
        name: author.name,
        title: quizzes.title,
        slug: quizzes.slug,
        at: quizzes.publishedAt,
      })
      .from(quizzes)
      .leftJoin(author, eq(author.id, quizzes.userId))
      .where(
        and(
          isNotNull(quizzes.publishedAt),
          isNull(quizzes.deletedAt),
          ne(quizzes.visibility, "PRIVATE"),
        ),
      )
      .orderBy(desc(quizzes.publishedAt), desc(quizzes.id))
      .limit(ACTIVITY_LIMIT),
    db
      .select({
        kind: moderationEvents.kind,
        at: moderationEvents.createdAt,
        actorName: actor.name,
        userId: moderationEvents.userId,
        targetName: target.name,
        quizTitle: quizzes.title,
        quizSlug: quizzes.slug,
        quizDeleted: quizzes.deletedAt,
      })
      .from(moderationEvents)
      .leftJoin(actor, eq(actor.id, moderationEvents.actorId))
      .leftJoin(target, eq(target.id, moderationEvents.userId))
      .leftJoin(quizzes, eq(quizzes.id, moderationEvents.quizId))
      .where(
        inArray(moderationEvents.kind, [
          "USER_BANNED",
          "QUIZ_HIDDEN",
          "QUIZ_SUSPENDED",
        ]),
      )
      .orderBy(desc(moderationEvents.createdAt), desc(moderationEvents.id))
      .limit(ACTIVITY_LIMIT + 4),
  ]);

  const items: FeedItem[] = [];

  for (const row of applications) {
    items.push({
      at: row.at,
      entry: {
        kind: "application",
        actor: row.name,
        text: "applied to become a creator",
        href: "/applications",
      },
    });
  }

  for (const row of reports) {
    items.push({
      at: row.at,
      entry: {
        kind: "report",
        actor: row.name,
        text: `reported ${row.title}`,
        href: `/quizzes/${row.slug}`,
      },
    });
  }

  for (const row of published) {
    if (!row.at) continue;

    items.push({
      at: row.at,
      entry: {
        kind: "published",
        actor: row.name ?? "Former member",
        text: `published ${row.title}`,
        href: `/quizzes/${row.slug}`,
      },
    });
  }

  for (const row of events) {
    if (row.kind === "USER_BANNED") {
      if (row.userId === null) continue;

      items.push({
        at: row.at,
        entry: {
          kind: "ban",
          actor: row.actorName ?? "Staff",
          text: `banned ${row.targetName ?? "a user"}`,
          href: `/users/${row.userId}`,
        },
      });
      continue;
    }

    // Quiz events only show while the quiz can still be opened
    if (!row.quizSlug || !row.quizTitle || row.quizDeleted) continue;

    if (row.kind === "QUIZ_HIDDEN") {
      items.push({
        at: row.at,
        entry: {
          kind: "hidden",
          actor: row.quizTitle,
          text: "was hidden automatically after reports",
          href: `/quizzes/${row.quizSlug}`,
        },
      });
    } else if (row.kind === "QUIZ_SUSPENDED") {
      items.push({
        at: row.at,
        entry: {
          kind: "suspended",
          actor: row.quizTitle,
          text: `was suspended by ${row.actorName ?? "staff"}`,
          href: `/quizzes/${row.quizSlug}`,
        },
      });
    }
  }

  return items
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, ACTIVITY_LIMIT)
    .map((item, index) => ({
      id: index + 1,
      ...item.entry,
      minutesAgo: Math.max(
        0,
        Math.round((now.getTime() - item.at.getTime()) / 60_000),
      ),
    }));
}

export async function getOverview({
  staffId,
  includeApplications,
}: {
  staffId: number;
  // Only admins decide on applications, so moderators don't see them
  includeApplications: boolean;
}): Promise<Overview> {
  const now = new Date();

  const [me] = await db
    .select({ timezone: users.timezone })
    .from(users)
    .where(eq(users.id, staffId))
    .limit(1);
  const timeZone = me?.timezone ?? "UTC";

  const [
    attention,
    summary,
    creatorRows,
    playRows,
    library,
    topics,
    days,
    popular,
    activity,
  ] = await Promise.all([
    loadAttention(now, includeApplications),
    getUserSummary(),
    db.select({ total: count() }).from(users).where(eq(users.role, "CREATOR")),
    db.select({ total: count() }).from(quizAttempts).where(finishedAttempt),
    loadLibrary(),
    loadTopics(),
    loadDays(now, timeZone),
    listQuizzes({ sort: "popular", pageSize: TOP_QUIZZES }),
    loadActivity(now, includeApplications),
  ]);

  const published =
    library.find((slice) => slice.key === "published")?.count ?? 0;
  const drafts = library.find((slice) => slice.key === "drafts")?.count ?? 0;

  const totals: TotalItem[] = [
    {
      key: "users",
      label: "Total users",
      value: summary.total,
      note: `${summary.newThisWeek} joined this week`,
    },
    {
      key: "creators",
      label: "Creators",
      value: creatorRows[0]?.total ?? 0,
      note: includeApplications
        ? `${plural(attention.pending, "application")} waiting`
        : "Can publish quizzes",
    },
    {
      key: "quizzes",
      label: "Published quizzes",
      value: published,
      note: `${plural(drafts, "draft")} in progress`,
    },
    {
      key: "plays",
      label: "Quizzes played",
      value: playRows[0]?.total ?? 0,
      note: "All time",
    },
  ];

  return {
    attention: attention.items,
    totals,
    days,
    topics,
    library,
    topQuizzes: popular.items.map((quiz) => ({
      slug: quiz.slug,
      title: quiz.title,
      categoryName: quiz.category.name,
      plays: quiz.plays,
      avgRating: quiz.avgRating,
    })),
    activity,
  };
}
