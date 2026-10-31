import type { QuestionType } from "@/types/play";
import type { ResultStatus } from "@/types/result";

export type ReviewStatus = "correct" | "incorrect" | "skipped";

export type ReviewCounts = Record<ReviewStatus, number>;

export type ReviewOption = {
  id: number;
  label: string;
  isCorrect: boolean;
  isSelected: boolean;
};

export type ReviewQuestion = {
  id: number;
  number: number;
  type: QuestionType;
  title: string;
  explanation: string | null;
  status: ReviewStatus;
  timeSpentSeconds: number | null;
  options: ReviewOption[];
};

export type QuizReview = {
  slug: string;
  title: string;
  status: ResultStatus;
  score: number;
  total: number;
  answered: number;
  percentage: number;
  canPlayAgain: boolean;
  questions: ReviewQuestion[];
};
