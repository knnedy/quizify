import type { Role } from "@/lib/roles";

export type QuizState = "PUBLISHED" | "DRAFT" | "SUSPENDED" | "ARCHIVED";

export type Ban = {
  reason: string;
  bannedAt: Date | null;
  bannedBy: string | null;
  expiresAt: Date | null;
};

export type PlayEntry = {
  quiz: string;
  slug: string;
  score: number;
  total: number;
  at: Date;
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
  at: Date;
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
  at: Date;
  text: string;
};

export type AccountInfo = {
  sessions: number;
  timezone: string;
};

export type UserRow = {
  id: number;
  name: string;
  email: string;
  role: Role;
  joinedAt: Date;
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
