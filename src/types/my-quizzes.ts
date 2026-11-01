import type { Difficulty } from "@/lib/difficulty";

export type MyQuizStatus = "PUBLISHED" | "DRAFT" | "ARCHIVED" | "SUSPENDED";
export type Visibility = "PUBLIC" | "UNLISTED" | "PRIVATE";

export type MyQuiz = {
  slug: string;
  title: string;
  category: { name: string; slug: string };
  difficulty: Difficulty;
  status: MyQuizStatus;
  visibility: Visibility;
  questions: number;
  plays: number;
  avgRating: number | null;
  ratings: number;
  updatedAt: Date;
  suspensionReason: string | null;
};

export type Application = {
  submittedAt: Date;
  reviewedAt: Date | null;
  rejectionReason: string | null;
  canReapplyAt: Date | null;
};

export type CreatorSummary = {
  totalPlays: number;
  published: number;
  avgRating: number | null;
  ratings: number;
};

export type MyQuizzesView =
  | { state: "none"; completed: number; required: number }
  | { state: "pending"; application: Application }
  | { state: "rejected"; application: Application; canReapply: boolean }
  | { state: "creator"; quizzes: MyQuiz[]; summary: CreatorSummary };
