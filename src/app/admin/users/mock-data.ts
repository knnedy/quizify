export type UserRole = "USER" | "CREATOR" | "MODERATOR" | "ADMIN";
export type QuizState = "PUBLISHED" | "DRAFT" | "SUSPENDED" | "ARCHIVED";

export type Ban = {
  reason: string;
  bannedAt: string | null;
  bannedBy: string;
  expiresAt: string | null;
};

export type PlayEntry = {
  quiz: string;
  slug: string;
  score: number;
  total: number;
  at: string;
};

export type CreatorQuiz = {
  title: string;
  slug: string;
  status: QuizState;
  plays: number;
};

export type CreatorStats = {
  published: number;
  drafts: number;
  suspended: number;
  plays: number;
  avgRating: number | null;
  openReports: number;
  quizzes: CreatorQuiz[];
};

export type HistoryKind =
  | "JOINED"
  | "CREATOR_APPROVED"
  | "CREATOR_REVOKED"
  | "BANNED"
  | "UNBANNED";

export type HistoryEntry = {
  kind: HistoryKind;
  at: string | null;
  by: string | null;
  note: string | null;
};

export type UserStats = {
  completed: number;
  averagePercentage: number | null;
  totalXp: number;
  currentStreak: number;
  bestStreak: number;
  perfectScores: number;
  weekly: number[];
};

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  joinedAt: string;
  lastActiveDays: number | null;
  ban: Ban | null;
  stats: UserStats;
  recent: PlayEntry[];
  creator: CreatorStats | null;
  history: HistoryEntry[];
};

export type UserChange =
  | { kind: "BAN"; reason: string; days: number | null; hideQuizzes: boolean }
  | { kind: "UNBAN" }
  | { kind: "REVOKE" };

type Seed = [
  id: number,
  name: string,
  role: UserRole,
  joinedDaysAgo: number,
  activeDaysAgo: number | null,
  completed: number,
  xp: number,
];

const DAY = 86_400_000;
const BASE = Date.parse("2026-10-20");

export function daysAgo(days: number) {
  return new Date(BASE - days * DAY).toISOString();
}

export function inDays(days: number) {
  return new Date(BASE + days * DAY).toISOString();
}

const seeds: Seed[] = [
  [1, "Njeri Kariuki", "ADMIN", 410, 0, 88, 14200],
  [2, "Tom Kiprop", "MODERATOR", 300, 1, 61, 9800],
  [3, "Amina Wanjiru", "CREATOR", 220, 0, 120, 18400],
  [4, "Brian Otieno", "CREATOR", 94, 1, 21, 3640],
  [5, "Lucy Achieng", "CREATOR", 120, 2, 34, 5120],
  [6, "Kevin Njoroge", "USER", 58, 0, 9, 1420],
  [7, "Faith Mutua", "USER", 5, 0, 3, 310],
  [8, "Hassan Daud", "USER", 77, 6, 15, 2260],
  [9, "Wanjiku Mwangi", "USER", 41, 3, 12, 1890],
  [10, "Daniel Sang", "USER", 30, 19, 4, 450],
  [11, "Peter Kamau", "CREATOR", 66, 30, 18, 2780],
  [12, "Grace Lemayian", "USER", 12, 12, 3, 280],
  [13, "Joseph Mutiso", "USER", 201, 70, 27, 4210],
  [14, "Mercy Atieno", "USER", 18, 0, 6, 760],
];

const bans: Record<
  number,
  { reason: string; daysAgo: number; days: number | null; by: string }
> = {
  10: {
    reason:
      "Posted links promoting an online store in several quiz descriptions.",
    daysAgo: 14,
    days: null,
    by: "Njeri Kariuki",
  },
  11: {
    reason: "Targeted other players with abusive comments in quiz ratings.",
    daysAgo: 3,
    days: 7,
    by: "Tom Kiprop",
  },
};

// Joseph is a former creator: the role is gone, the quizzes are not.
const creatorIds = new Set([3, 4, 5, 11, 13]);

const plays: [title: string, total: number][] = [
  ["Capital cities of Africa", 12],
  ["Solar system essentials", 10],
  ["JavaScript gotchas", 15],
  ["World Cup trivia", 15],
  ["Kenyan geography", 15],
  ["Human body basics", 15],
  ["Flags of the world", 30],
  ["Ancient Egypt", 12],
];

const creatorTitles = [
  "Kenyan geography",
  "Nairobi street food",
  "Git in practice",
  "East African history",
  "Intro to Python",
  "Benga and beyond",
  "Coffee origins",
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function hash(value: string) {
  let result = 0;
  for (const char of value) {
    result = (result * 31 + char.charCodeAt(0)) >>> 0;
  }
  return result;
}

function buildStats(
  h: number,
  completed: number,
  xp: number,
  active: number | null,
): UserStats {
  const idleWeeks = active === null ? 12 : Math.min(12, Math.floor(active / 7));
  const weekly = Array.from({ length: 12 }, (_, index) => {
    if (index >= 12 - idleWeeks) return 0;
    const weight = 0.4 + ((h >>> index) % 11) / 7;
    return Math.max(0, Math.round((completed / 12) * weight));
  });
  const current = active !== null && active <= 1 ? 1 + (h % 12) : 0;

  return {
    completed,
    averagePercentage: completed === 0 ? null : 52 + (h % 41),
    totalXp: xp,
    currentStreak: current,
    bestStreak: Math.max(current, 3 + (h % 14)),
    perfectScores: Math.floor(completed / (4 + (h % 5))),
    weekly,
  };
}

function buildRecent(
  h: number,
  completed: number,
  active: number | null,
): PlayEntry[] {
  let age = active ?? 0;

  return Array.from({ length: Math.min(5, completed) }, (_, index) => {
    const [title, total] = plays[(h + index * 3) % plays.length];
    if (index > 0) age += 1 + ((h >>> index) % 3);

    return {
      quiz: title,
      slug: slugify(title),
      score: Math.max(1, total - ((h >>> (index + 3)) % 6)),
      total,
      at: daysAgo(age),
    };
  });
}

function buildCreator(id: number, h: number): CreatorStats {
  const published = 2 + (h % 6);
  const drafts = h % 3;
  const suspended = id === 11 ? 1 : 0;

  const states: QuizState[] = [
    ...Array<QuizState>(Math.min(published, 3)).fill("PUBLISHED"),
    ...Array<QuizState>(Math.min(drafts, 1)).fill("DRAFT"),
    ...Array<QuizState>(suspended).fill("SUSPENDED"),
  ];

  const quizzes = states.map((status, index): CreatorQuiz => {
    const title = creatorTitles[(h + index) % creatorTitles.length];
    return {
      title,
      slug: slugify(title),
      status,
      plays: status === "DRAFT" ? 0 : 120 + ((h >>> index) % 2400),
    };
  });

  return {
    published,
    drafts,
    suspended,
    plays: published * (300 + (h % 900)),
    avgRating: 4 + (h % 10) / 10,
    openReports: id === 11 ? 2 : 0,
    quizzes,
  };
}

function buildHistory(
  id: number,
  joined: number,
  ban: Ban | null,
  banAge: number,
): HistoryEntry[] {
  const items: { age: number; entry: HistoryEntry }[] = [
    {
      age: joined,
      entry: { kind: "JOINED", at: daysAgo(joined), by: null, note: null },
    },
  ];

  if (creatorIds.has(id)) {
    const age = Math.max(2, Math.floor(joined / 2));
    items.push({
      age,
      entry: {
        kind: "CREATOR_APPROVED",
        at: daysAgo(age),
        by: "Njeri Kariuki",
        note: null,
      },
    });
  }

  if (id === 13) {
    items.push({
      age: 40,
      entry: {
        kind: "CREATOR_REVOKED",
        at: daysAgo(40),
        by: "Njeri Kariuki",
        note: "Two quizzes were reported for copied questions.",
      },
    });
  }

  if (ban) {
    items.push({
      age: banAge,
      entry: {
        kind: "BANNED",
        at: ban.bannedAt,
        by: ban.bannedBy,
        note: ban.reason,
      },
    });
  }

  return items.sort((a, b) => a.age - b.age).map((item) => item.entry);
}

function build([
  id,
  name,
  role,
  joined,
  active,
  completed,
  xp,
]: Seed): AdminUser {
  const h = hash(name);
  const banSeed = bans[id];

  const ban: Ban | null = banSeed
    ? {
        reason: banSeed.reason,
        bannedAt: daysAgo(banSeed.daysAgo),
        bannedBy: banSeed.by,
        expiresAt:
          banSeed.days === null
            ? null
            : daysAgo(banSeed.daysAgo - banSeed.days),
      }
    : null;

  return {
    id,
    name,
    email: `${name
      .toLowerCase()
      .replace(/[^a-z]+/g, ".")
      .replace(/^\.|\.$/g, "")}@example.com`,
    role,
    joinedAt: daysAgo(joined),
    lastActiveDays: active,
    ban,
    stats: buildStats(h, completed, xp, active),
    recent: buildRecent(h, completed, active),
    creator: creatorIds.has(id) ? buildCreator(id, h) : null,
    history: buildHistory(id, joined, ban, banSeed?.daysAgo ?? 0),
  };
}

export async function getUsers() {
  const users = seeds
    .map(build)
    .sort((a, b) => (a.lastActiveDays ?? 999) - (b.lastActiveDays ?? 999));

  return { users };
}

// Stand-in for what the real ban, unban and role actions do in the database.
// The workspace keeps a list of changes per user and replays them here, so an
// undo is just dropping the last one.
export function applyUserChanges(
  user: AdminUser,
  changes: UserChange[] = [],
): AdminUser {
  return changes.reduce<AdminUser>((current, change) => {
    switch (change.kind) {
      case "BAN": {
        const hidden = change.hideQuizzes && current.creator !== null;

        return {
          ...current,
          ban: {
            reason: change.reason,
            bannedAt: null,
            bannedBy: "you",
            expiresAt: change.days === null ? null : inDays(change.days),
          },
          creator:
            hidden && current.creator
              ? {
                  ...current.creator,
                  published: 0,
                  suspended:
                    current.creator.suspended + current.creator.published,
                  quizzes: current.creator.quizzes.map((quiz) =>
                    quiz.status === "PUBLISHED"
                      ? { ...quiz, status: "SUSPENDED" }
                      : quiz,
                  ),
                }
              : current.creator,
          history: [
            { kind: "BANNED", at: null, by: "you", note: change.reason },
            ...current.history,
          ],
        };
      }

      case "UNBAN":
        return {
          ...current,
          ban: null,
          history: [
            { kind: "UNBANNED", at: null, by: "you", note: null },
            ...current.history,
          ],
        };

      case "REVOKE":
        return {
          ...current,
          role: "USER",
          history: [
            { kind: "CREATOR_REVOKED", at: null, by: "you", note: null },
            ...current.history,
          ],
        };
    }
  }, user);
}
