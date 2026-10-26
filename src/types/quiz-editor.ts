import type { Difficulty } from "@/lib/difficulty";

export type QuestionType = "SINGLE" | "MULTIPLE" | "TRUE_FALSE";
export type QuizVisibility = "PUBLIC" | "UNLISTED" | "PRIVATE";
export type QuizStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED" | "SUSPENDED";

export type EditorOption = {
  key: string;
  label: string;
  isCorrect: boolean;
};

export type EditorQuestion = {
  key: string;
  type: QuestionType;
  title: string;
  explanation: string;
  options: EditorOption[];
};

export type QuizSettings = {
  title: string;
  description: string;
  category: string | null;
  difficulty: Difficulty;
  visibility: QuizVisibility;
  timeLimitMinutes: number | null;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  maxAttempts: number | null;
  tags: string[];
};

export type EditorSelection =
  | { kind: "details" }
  | { kind: "question"; key: string };

export type EditorIssue = {
  target: EditorSelection | null;
  message: string;
};

export type CategoryOption = {
  name: string;
  slug: string;
};
