import { listQuizzes } from "@/app/(app)/quizzes/mock-data";
import { getApplications } from "../applications/mock-data";
import { getReports } from "../reports/mock-data";
import { getUserSummary, listUsers } from "../users/mock-data";
import type { DayPoint } from "./metrics";

export type AttentionKey = "applications" | "reports" | "bans";
export type AttentionTone = "urgent" | "normal" | "clear";

export type AttentionItem = {
  key: AttentionKey;
  label: string;
  count: number;
  note: string;
  cta: string;
  href: string;
  tone: AttentionTone;
};

export type TotalKey = "users" | "creators" | "quizzes" | "plays";

export type TotalItem = {
  key: TotalKey;
  label: string;
  value: number;
  note: string;
};

export type TopicRow = {
  slug: string;
  name: string;
  plays: number;
  quizzes: number;
};

export type LibraryKey = "published" | "drafts" | "archived" | "suspended";

export type LibrarySlice = {
  key: LibraryKey;
  label: string;
  count: number;
};

export type TopQuiz = {
  slug: string;
  title: string;
  categoryName: string;
  plays: number;
  avgRating: number | null;
};

export type ActivityKind =
  | "application"
  | "report"
  | "hidden"
  | "ban"
  | "published"
  | "suspended";

export type ActivityEntry = {
  id: number;
  kind: ActivityKind;
  actor: string;
  text: string;
  href: string;
  minutesAgo: number;
};

export type Overview = {
  attention: AttentionItem[];
  totals: TotalItem[];
  days: DayPoint[];
  topics: TopicRow[];
  library: LibrarySlice[];
  topQuizzes: TopQuiz[];
  activity: ActivityEntry[];
};

const DAY = 86_400_000;
const BASE = Date.parse("2026-10-20");
const SERIES_DAYS = 180;
const DRAFTS = 9;
const ARCHIVED = 4;

// Sunday first, to match Date.getUTCDay.
const weekday = [1.15, 0.95, 0.9, 0.92, 0.95, 1.05, 1.2];

function plural(count: number, word: string) {
  return `${count} ${count === 1 ? word : `${word}s`}`;
}

function hash(value: string) {
  let result = 0;
  for (const char of value) {
    result = (result * 31 + char.charCodeAt(0)) >>> 0;
  }
  return result;
}

function noise(index: number, salt: string) {
  return (hash(`${salt}:${index}`) % 1000) / 1000;
}

// The last seven days of sign-ups are nudged to match the Users page, so the
// two screens agree on "new this week".
function anchorSignups(points: DayPoint[], target: number) {
  const tail = points.slice(-7);
  let diff = target - tail.reduce((sum, point) => sum + point.signups, 0);
  let step = 0;

  while (diff !== 0 && step < 200) {
    const point = tail[step % tail.length];

    if (diff > 0) {
      point.signups += 1;
      diff -= 1;
    } else if (point.signups > 0) {
      point.signups -= 1;
      diff += 1;
    }
    step += 1;
  }
}

function buildDays(newThisWeek: number): DayPoint[] {
  const points = Array.from({ length: SERIES_DAYS }, (_, index): DayPoint => {
    const date = new Date(BASE - (SERIES_DAYS - 1 - index) * DAY);
    const dow = weekday[date.getUTCDay()];
    const growth = 0.72 + 0.4 * (index / (SERIES_DAYS - 1));
    const spike = index >= 150 && index <= 153 ? 1.35 : 1;

    return {
      date: date.toISOString(),
      plays: Math.round(
        118 * growth * dow * spike * (0.88 + 0.24 * noise(index, "plays")),
      ),
      players: Math.round(
        34 *
          growth *
          (0.5 + dow * 0.5) *
          (spike > 1 ? 1.2 : 1) *
          (0.9 + 0.2 * noise(index, "players")),
      ),
      signups: Math.round(
        0.9 *
          growth *
          (spike > 1 ? 2 : 1) *
          (0.3 + 1.4 * noise(index, "signups")),
      ),
      score:
        Math.round(
          (64 +
            5 * (index / (SERIES_DAYS - 1)) +
            (noise(index, "score") - 0.5) * 6) *
            10,
        ) / 10,
    };
  });

  anchorSignups(points, newThisWeek);
  return points;
}

const activity: ActivityEntry[] = [
  {
    id: 1,
    kind: "application",
    actor: "Hassan Daud",
    text: "applied to become a creator",
    href: "/admin/applications",
    minutesAgo: 35,
  },
  {
    id: 2,
    kind: "report",
    actor: "Brian Otieno",
    text: "reported Oscar-winning films",
    href: "/admin/quizzes/oscar-winning-films",
    minutesAgo: 125,
  },
  {
    id: 3,
    kind: "report",
    actor: "Grace Lemayian",
    text: "reported Flags of the world",
    href: "/admin/quizzes/flags-of-the-world",
    minutesAgo: 190,
  },
  {
    id: 4,
    kind: "published",
    actor: "Lucy Achieng",
    text: "published Animated movie sidekicks",
    href: "/quizzes/animated-movie-sidekicks",
    minutesAgo: 310,
  },
  {
    id: 5,
    kind: "application",
    actor: "Faith Mutua",
    text: "applied to become a creator",
    href: "/admin/applications",
    minutesAgo: 1480,
  },
  {
    id: 6,
    kind: "hidden",
    actor: "Benga and beyond",
    text: "was hidden automatically after 3 reports",
    href: "/admin/quizzes/benga-and-beyond",
    minutesAgo: 2900,
  },
  {
    id: 7,
    kind: "ban",
    actor: "Tom Kiprop",
    text: "banned Peter Kamau for 7 days",
    href: "/admin/users/11",
    minutesAgo: 4400,
  },
  {
    id: 8,
    kind: "suspended",
    actor: "Sci-fi movie quotes",
    text: "was suspended by Tom Kiprop",
    href: "/admin/quizzes/sci-fi-movie-quotes",
    minutesAgo: 12900,
  },
];

// Stand-in for the real overview queries. Counts come from the other admin
// mocks so the numbers agree across screens. The daily series is generated.
export async function getOverview(): Promise<Overview> {
  const [pending, reports, summary, banned, catalog, popular] =
    await Promise.all([
      getApplications({ status: "PENDING" }),
      getReports(),
      getUserSummary(),
      listUsers({
        q: "",
        filter: "banned",
        sort: "joined",
        dir: "desc",
        page: 1,
      }),
      listQuizzes({ pageSize: 100 }),
      listQuizzes({ sort: "popular", pageSize: 5 }),
    ]);

  const waiting = pending.items;
  const longestWait =
    waiting.length > 0
      ? Math.max(...waiting.map((item) => item.waitingDays))
      : 0;

  const open = reports.items.filter((item) => item.status === "OPEN");
  const hidden = open.filter((item) => item.hiddenAutomatically).length;
  const oldestReport =
    open.length > 0
      ? Math.max(
          ...open.flatMap((item) =>
            item.reports.map((report) => report.daysAgo),
          ),
        )
      : 0;

  const endingSoon = banned.items
    .map((user) =>
      user.ban?.expiresAt
        ? Math.ceil((Date.parse(user.ban.expiresAt) - BASE) / DAY)
        : null,
    )
    .filter((days): days is number => days !== null && days >= 0 && days <= 7);
  const nextBanEnds = endingSoon.length > 0 ? Math.min(...endingSoon) : 0;

  const attention: AttentionItem[] = [
    {
      key: "applications",
      label: "Creator applications",
      count: waiting.length,
      note:
        waiting.length === 0
          ? "Nothing waiting"
          : longestWait === 0
            ? "All applied today"
            : `Longest wait: ${plural(longestWait, "day")}`,
      cta: "Review applications",
      href: "/admin/applications",
      tone:
        waiting.length === 0 ? "clear" : longestWait >= 5 ? "urgent" : "normal",
    },
    {
      key: "reports",
      label: "Open reports",
      count: open.length,
      note:
        open.length === 0
          ? "Nothing to review"
          : hidden > 0
            ? `${hidden} hidden from players`
            : `Oldest: ${oldestReport === 0 ? "today" : plural(oldestReport, "day")}`,
      cta: "Open the queue",
      href: "/admin/reports",
      tone: open.length === 0 ? "clear" : hidden > 0 ? "urgent" : "normal",
    },
    {
      key: "bans",
      label: "Bans ending this week",
      count: endingSoon.length,
      note:
        endingSoon.length === 0
          ? "No bans ending soon"
          : `Next one ends in ${plural(nextBanEnds, "day")}`,
      cta: "See banned users",
      href: "/admin/users?filter=banned",
      tone: endingSoon.length === 0 ? "clear" : "normal",
    },
  ];

  const totalPlays = catalog.items.reduce((sum, quiz) => sum + quiz.plays, 0);

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
      value: banned.counts.creators,
      note: `${plural(waiting.length, "application")} waiting`,
    },
    {
      key: "quizzes",
      label: "Published quizzes",
      value: catalog.total,
      note: `${plural(DRAFTS, "draft")} in progress`,
    },
    {
      key: "plays",
      label: "Quizzes played",
      value: totalPlays,
      note: "All time",
    },
  ];

  const topicMap = new Map<string, TopicRow>();
  for (const quiz of catalog.items) {
    const row = topicMap.get(quiz.category.slug) ?? {
      slug: quiz.category.slug,
      name: quiz.category.name,
      plays: 0,
      quizzes: 0,
    };

    row.plays += quiz.plays;
    row.quizzes += 1;
    topicMap.set(row.slug, row);
  }
  const topics = [...topicMap.values()].sort((a, b) => b.plays - a.plays);

  const suspended = reports.items.filter(
    (item) =>
      item.status === "SUSPENDED" ||
      (item.status === "OPEN" && item.hiddenAutomatically),
  ).length;

  const library: LibrarySlice[] = [
    { key: "published", label: "Published", count: catalog.total },
    { key: "drafts", label: "Drafts", count: DRAFTS },
    { key: "archived", label: "Archived", count: ARCHIVED },
    { key: "suspended", label: "Suspended or hidden", count: suspended },
  ];

  const topQuizzes: TopQuiz[] = popular.items.map((quiz) => ({
    slug: quiz.slug,
    title: quiz.title,
    categoryName: quiz.category.name,
    plays: quiz.plays,
    avgRating: quiz.avgRating,
  }));

  return {
    attention,
    totals,
    days: buildDays(summary.newThisWeek),
    topics,
    library,
    topQuizzes,
    activity,
  };
}
