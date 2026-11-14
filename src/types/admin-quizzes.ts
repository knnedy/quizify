import type { Difficulty } from "@/lib/difficulty";
import type { Report } from "@/types/admin-reports";
import type { QuestionType } from "@/types/play";

export type PreviewStatus =
  | "PUBLISHED"
  | "HIDDEN"
  | "SUSPENDED"
  | "UNPUBLISHED"
  | "DELETED";

export type Visibility = "PUBLIC" | "UNLISTED" | "PRIVATE";

export type PreviewOption = { label: string; isCorrect: boolean };

export type PreviewQuestion = {
  number: number;
  type: QuestionType;
  title: string;
  explanation: string | null;
  options: PreviewOption[];
};

export type Moderation = {
  status: PreviewStatus;
  note: string | null;
  by: string | null;
  at: Date | null;
};

export type AdminCreator = {
  id: number;
  name: string;
  former: boolean;
  published: number;
  strikes: number;
};

export type PreviewReport = Report & {
  status: "OPEN" | "DISMISSED" | "ACTIONED";
};

export type AdminQuizPreview = {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: { name: string; slug: string };
  // Missing when the creator's account was deleted
  creator: AdminCreator | null;
  difficulty: Difficulty;
  visibility: Visibility;
  timeLimitMinutes: number | null;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  maxAttempts: number | null;
  tags: string[];
  publishedDaysAgo: number | null;
  plays: number;
  questions: PreviewQuestion[];
  reports: PreviewReport[];
  moderation: Moderation;
};
