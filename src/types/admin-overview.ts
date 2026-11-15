import type { DayPoint } from "@/lib/admin-metrics";

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
