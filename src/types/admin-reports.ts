import type { ReportReason } from "@/lib/report-reasons";

export type ReportStatus = "OPEN" | "DISMISSED" | "SUSPENDED" | "DELETED";

// What is happening to the quiz right now
export type QuizVisibility =
  | "LIVE"
  | "HIDDEN_AUTO"
  | "HIDDEN_STAFF"
  | "UNPUBLISHED"
  | "DELETED";

export type Report = {
  id: number;
  reporter: { name: string; completed: number };
  reason: ReportReason;
  details: string | null;
  daysAgo: number;
};

export type ReportedQuiz = {
  // The quiz id
  id: number;
  status: ReportStatus;
  visibility: QuizVisibility;
  quiz: {
    slug: string;
    title: string;
    category: { name: string; slug: string };
    questions: number;
    plays: number;
    avgRating: number | null;
    publishedDaysAgo: number | null;
  };
  // Missing when the creator's account was deleted
  creator: {
    id: number;
    name: string;
    former: boolean;
    published: number;
    strikes: number;
  } | null;
  reports: Report[];
  decision: { by: string | null; at: Date; note: string | null } | null;
};

export type ReportsView = {
  open: ReportedQuiz[];
  resolved: ReportedQuiz[];
  counts: { open: number; resolved: number };
};
