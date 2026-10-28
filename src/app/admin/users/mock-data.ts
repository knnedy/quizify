import {
  USERS_PAGE_SIZE,
  type SortDirection,
  type UserFilter,
  type UserQuery,
  type UserSort,
} from "./query-params";

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

export type AdminNote = {
  id: number;
  by: string;
  at: string | null;
  text: string;
};

export type AccountInfo = {
  emailVerified: boolean;
  lastSignInDays: number | null;
  sessions: number;
  timezone: string;
};

export type UserRow = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  joinedAt: string;
  lastActiveDays: number | null;
  quizzesCompleted: number;
  totalXp: number;
  published: number;
  ban: Ban | null;
};

export type AdminUser = UserRow & {
  stats: UserStats;
  recent: PlayEntry[];
  creator: CreatorStats | null;
  history: HistoryEntry[];
  notes: AdminNote[];
  account: AccountInfo;
};

export type UserSummary = {
  total: number;
  newThisWeek: number;
  activeThisWeek: number;
  banned: number;
};

export type UserChange =
  | { kind: "BAN"; reason: string; days: number | null; hideQuizzes: boolean }
  | { kind: "UNBAN" }
  | { kind: "GRANT" }
  | { kind: "REVOKE" };

const DAY = 86_400_000;
const BASE = Date.parse("2026-10-20");

export function daysAgo(days: number) {
  return new Date(BASE - days * DAY).toISOString();
}

export function inDays(days: number) {
  return new Date(BASE + days * DAY).toISOString();
}

function hash(value: string) {
  let result = 0;
  for (const char of value) {
    result = (result * 31 + char.charCodeAt(0)) >>> 0;
  }
  return result;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function emailFor(name: string, suffix = "") {
  const local = name
    .toLowerCase()
    .replace(/[^a-z]+/g, ".")
    .replace(/^\.|\.$/g, "");

  return `${local}${suffix}@example.com`;
}

type BanSeed = {
  reason: string;
  daysAgo: number;
  days: number | null;
  by: string;
};

type Seed = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  joined: number;
  active: number | null;
  completed: number;
  xp: number;
  creator: boolean;
  revoked: boolean;
  ban: BanSeed | null;
};

function hand(
  id: number,
  name: string,
  role: UserRole,
  joined: number,
  active: number | null,
  completed: number,
  xp: number,
  extra: Partial<Pick<Seed, "creator" | "revoked" | "ban">> = {},
): Seed {
  return {
    id,
    name,
    email: emailFor(name),
    role,
    joined,
    active,
    completed,
    xp,
    creator: role === "CREATOR",
    revoked: false,
    ban: null,
    ...extra,
  };
}

const handSeeds: Seed[] = [
  hand(1, "Njeri Kariuki", "ADMIN", 410, 0, 88, 14200),
  hand(2, "Tom Kiprop", "MODERATOR", 300, 1, 61, 9800),
  hand(3, "Amina Wanjiru", "CREATOR", 220, 0, 120, 18400),
  hand(4, "Brian Otieno", "CREATOR", 94, 1, 21, 3640),
  hand(5, "Lucy Achieng", "CREATOR", 120, 2, 34, 5120),
  hand(6, "Kevin Njoroge", "USER", 58, 0, 9, 1420),
  hand(7, "Faith Mutua", "USER", 5, 0, 3, 310),
  hand(8, "Hassan Daud", "USER", 77, 6, 15, 2260),
  hand(9, "Wanjiku Mwangi", "USER", 41, 3, 12, 1890),
  hand(10, "Daniel Sang", "USER", 30, 19, 4, 450, {
    ban: {
      reason:
        "Posted links promoting an online store in several quiz descriptions.",
      daysAgo: 14,
      days: null,
      by: "Njeri Kariuki",
    },
  }),
  hand(11, "Peter Kamau", "CREATOR", 66, 30, 18, 2780, {
    ban: {
      reason: "Targeted other players with abusive comments in quiz ratings.",
      daysAgo: 3,
      days: 7,
      by: "Tom Kiprop",
    },
  }),
  hand(12, "Grace Lemayian", "USER", 12, 12, 3, 280),
  hand(13, "Joseph Mutiso", "USER", 201, 70, 27, 4210, {
    creator: true,
    revoked: true,
  }),
  hand(14, "Mercy Atieno", "USER", 18, 0, 6, 760),
];

const firstNames = [
  "Amina",
  "Brian",
  "Wanjiku",
  "Kevin",
  "Zawadi",
  "Otieno",
  "Lucy",
  "Faith",
  "Hassan",
  "Mercy",
  "Daniel",
  "Grace",
  "Peter",
  "Joseph",
  "Esther",
  "Samuel",
  "Naomi",
  "Isaac",
  "Halima",
  "Collins",
  "Ruth",
  "Moses",
  "Sharon",
  "Victor",
  "Beatrice",
  "Ahmed",
  "Dorcas",
  "Felix",
  "Irene",
  "Omar",
];

const lastNames = [
  "Wanjiru",
  "Otieno",
  "Mwangi",
  "Njoroge",
  "Kamau",
  "Achieng",
  "Mutua",
  "Daud",
  "Kiprop",
  "Sang",
  "Atieno",
  "Lemayian",
  "Mutiso",
  "Kariuki",
  "Odhiambo",
  "Chebet",
  "Karanja",
  "Wafula",
  "Barasa",
  "Njeri",
];

const banReasons = [
  "Posting spam and promotional links in quiz descriptions.",
  "Harassing other players in ratings and reports.",
  "Publishing inappropriate content after a warning.",
  "Abusing Quizify to farm XP unfairly.",
];

function generate(id: number): Seed {
  const h = hash(`user-${id}`);
  const name = `${firstNames[h % firstNames.length]} ${lastNames[(h >>> 7) % lastNames.length]}`;

  const completed = h % 7 === 0 ? 0 : 1 + ((h >>> 3) % 60);
  const joined = 3 + ((h >>> 5) % 420);
  const active = completed === 0 ? null : (h >>> 9) % 90;
  const creator = completed >= 8 && (h >>> 11) % 100 < 14;
  const banned = (h >>> 17) % 100 < 5;
  const banAge = Math.min(1 + ((h >>> 13) % 30), joined - 1);

  return {
    id,
    name,
    email: emailFor(name, String(id)),
    role: creator ? "CREATOR" : "USER",
    joined,
    active,
    completed,
    xp: completed * (60 + (h % 90)),
    creator,
    revoked: false,
    ban: banned
      ? {
          reason: banReasons[(h >>> 19) % banReasons.length],
          daysAgo: banAge,
          days: (h >>> 21) % 2 === 0 ? null : banAge + 5,
          by: (h >>> 23) % 2 === 0 ? "Njeri Kariuki" : "Tom Kiprop",
        }
      : null,
  };
}

const seeds: Seed[] = [
  ...handSeeds,
  ...Array.from({ length: 123 }, (_, index) => generate(15 + index)),
];

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

const timezones = [
  "Africa/Nairobi",
  "Europe/London",
  "America/New_York",
  "Asia/Kolkata",
  "Africa/Lagos",
];

const noteSeeds: Record<
  number,
  { by: string; daysAgo: number; text: string }[]
> = {
  10: [
    {
      by: "Njeri Kariuki",
      daysAgo: 13,
      text: "Emailed about the store links. No reply yet.",
    },
  ],
  11: [
    {
      by: "Tom Kiprop",
      daysAgo: 3,
      text: "Two reports in a week, both about comments on ratings. Seven days to cool off.",
    },
    {
      by: "Njeri Kariuki",
      daysAgo: 45,
      text: "Approved as a creator after a strong application.",
    },
  ],
  13: [
    {
      by: "Njeri Kariuki",
      daysAgo: 40,
      text: "Role removed after copied questions were reported. Quizzes left up for now.",
    },
  ],
};

const emptyCreator: CreatorStats = {
  published: 0,
  drafts: 0,
  suspended: 0,
  plays: 0,
  avgRating: null,
  openReports: 0,
  quizzes: [],
};

function toBan(ban: BanSeed | null): Ban | null {
  if (!ban) return null;

  return {
    reason: ban.reason,
    bannedAt: daysAgo(ban.daysAgo),
    bannedBy: ban.by,
    expiresAt: ban.days === null ? null : daysAgo(ban.daysAgo - ban.days),
  };
}

function toRow(seed: Seed): UserRow {
  return {
    id: seed.id,
    name: seed.name,
    email: seed.email,
    role: seed.role,
    joinedAt: daysAgo(seed.joined),
    lastActiveDays: seed.active,
    quizzesCompleted: seed.completed,
    totalXp: seed.xp,
    published: seed.creator ? 2 + (hash(seed.name) % 6) : 0,
    ban: toBan(seed.ban),
  };
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

function buildHistory(seed: Seed, ban: Ban | null): HistoryEntry[] {
  const items: { age: number; entry: HistoryEntry }[] = [
    {
      age: seed.joined,
      entry: {
        kind: "JOINED",
        at: daysAgo(seed.joined),
        by: null,
        note: null,
      },
    },
  ];

  if (seed.creator) {
    const age = Math.max(2, Math.floor(seed.joined / 2));
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

  if (seed.revoked) {
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

  if (ban && seed.ban) {
    items.push({
      age: seed.ban.daysAgo,
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

function toDetail(seed: Seed): AdminUser {
  const h = hash(seed.name);
  const row = toRow(seed);

  return {
    ...row,
    stats: buildStats(h, seed.completed, seed.xp, seed.active),
    recent: buildRecent(h, seed.completed, seed.active),
    creator: seed.creator ? buildCreator(seed.id, h) : null,
    history: buildHistory(seed, row.ban),
    notes: (noteSeeds[seed.id] ?? [])
      .slice()
      .sort((a, b) => a.daysAgo - b.daysAgo)
      .map((note, index) => ({
        id: index + 1,
        by: note.by,
        at: daysAgo(note.daysAgo),
        text: note.text,
      })),
    account: {
      emailVerified: h % 9 !== 0,
      lastSignInDays: seed.active ?? Math.min(seed.joined, h % 4),
      sessions: 1 + (h % 3),
      timezone: timezones[h % timezones.length],
    },
  };
}

const rows = seeds.map(toRow);

const filterTests: Record<UserFilter, (user: UserRow) => boolean> = {
  all: () => true,
  players: (user) => user.role === "USER",
  creators: (user) => user.role === "CREATOR",
  staff: (user) => user.role === "MODERATOR" || user.role === "ADMIN",
  banned: (user) => user.ban !== null,
};

function sortValue(sort: UserSort, row: UserRow): string | number {
  switch (sort) {
    case "name":
      return row.name.toLowerCase();
    case "joined":
      return Date.parse(row.joinedAt);
    case "active":
      return row.lastActiveDays === null ? -9999 : -row.lastActiveDays;
    case "xp":
      return row.totalXp;
    case "quizzes":
      return row.quizzesCompleted;
  }
}

function compare(sort: UserSort, dir: SortDirection, a: UserRow, b: UserRow) {
  const left = sortValue(sort, a);
  const right = sortValue(sort, b);

  const order =
    typeof left === "string" && typeof right === "string"
      ? left.localeCompare(right)
      : Number(left) - Number(right);

  return (order || a.id - b.id) * (dir === "asc" ? 1 : -1);
}

// Stand-in for the real paged query: filter, search, sort and slice happen in
// the database there, and only one page of rows ever reaches the server.
export async function listUsers(query: UserQuery) {
  const term = query.q.toLowerCase();

  const matching = rows.filter(
    (row) =>
      !term ||
      row.name.toLowerCase().includes(term) ||
      row.email.toLowerCase().includes(term),
  );

  const counts: Record<UserFilter, number> = {
    all: matching.length,
    players: matching.filter(filterTests.players).length,
    creators: matching.filter(filterTests.creators).length,
    staff: matching.filter(filterTests.staff).length,
    banned: matching.filter(filterTests.banned).length,
  };

  const filtered = matching
    .filter(filterTests[query.filter])
    .sort((a, b) => compare(query.sort, query.dir, a, b));

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / USERS_PAGE_SIZE));
  const page = Math.min(query.page, pageCount);
  const items = filtered.slice(
    (page - 1) * USERS_PAGE_SIZE,
    page * USERS_PAGE_SIZE,
  );

  return { items, total, page, pageCount, counts };
}

export async function getUserSummary(): Promise<UserSummary> {
  return {
    total: rows.length,
    newThisWeek: seeds.filter((seed) => seed.joined <= 7).length,
    activeThisWeek: rows.filter(
      (row) => row.lastActiveDays !== null && row.lastActiveDays <= 7,
    ).length,
    banned: rows.filter((row) => row.ban !== null).length,
  };
}

export async function getUserDetail(id: number): Promise<AdminUser | null> {
  const seed = seeds.find((item) => item.id === id);
  return seed ? toDetail(seed) : null;
}

// Stand-ins for what the real ban, role and unban actions do in the database.
// The screens keep a list of changes and replay them here, so an undo is just
// dropping the last one.
export function applyToRow(row: UserRow, changes: UserChange[] = []): UserRow {
  return changes.reduce<UserRow>((current, change) => {
    switch (change.kind) {
      case "BAN":
        return {
          ...current,
          ban: {
            reason: change.reason,
            bannedAt: null,
            bannedBy: "you",
            expiresAt: change.days === null ? null : inDays(change.days),
          },
          published: change.hideQuizzes ? 0 : current.published,
        };
      case "UNBAN":
        return { ...current, ban: null };
      case "GRANT":
        return { ...current, role: "CREATOR" };
      case "REVOKE":
        return { ...current, role: "USER" };
    }
  }, row);
}

export function applyToDetail(
  user: AdminUser,
  changes: UserChange[] = [],
): AdminUser {
  return changes.reduce<AdminUser>((current, change) => {
    const row = applyToRow(current, [change]);
    const base = {
      ...current,
      role: row.role,
      ban: row.ban,
      published: row.published,
    };

    switch (change.kind) {
      case "BAN": {
        const creator = current.creator;
        const hide = change.hideQuizzes && creator !== null;

        return {
          ...base,
          creator:
            hide && creator
              ? {
                  ...creator,
                  published: 0,
                  suspended: creator.suspended + creator.published,
                  quizzes: creator.quizzes.map((quiz) =>
                    quiz.status === "PUBLISHED"
                      ? { ...quiz, status: "SUSPENDED" as const }
                      : quiz,
                  ),
                }
              : creator,
          history: [
            { kind: "BANNED", at: null, by: "you", note: change.reason },
            ...current.history,
          ],
        };
      }

      case "UNBAN":
        return {
          ...base,
          history: [
            { kind: "UNBANNED", at: null, by: "you", note: null },
            ...current.history,
          ],
        };

      case "GRANT":
        return {
          ...base,
          creator: current.creator ?? emptyCreator,
          history: [
            { kind: "CREATOR_APPROVED", at: null, by: "you", note: null },
            ...current.history,
          ],
        };

      case "REVOKE":
        return {
          ...base,
          history: [
            { kind: "CREATOR_REVOKED", at: null, by: "you", note: null },
            ...current.history,
          ],
        };
    }
  }, user);
}
