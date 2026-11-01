import type { Difficulty } from "@/lib/difficulty";

export type QuestionType = "SINGLE" | "MULTIPLE" | "TRUE_FALSE";
export type QuizVisibility = "PUBLIC" | "UNLISTED" | "PRIVATE";
export type QuizStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED" | "SUSPENDED";

export type EditorOption = {
  // The database id. Missing until the option has been saved once.
  id?: number;
  key: string;
  label: string;
  isCorrect: boolean;
};

export type EditorQuestion = {
  id?: number;
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

export type EditableQuiz = {
  slug: string;
  status: QuizStatus;
  suspensionReason: string | null;
  settings: QuizSettings;
  questions: EditorQuestion[];
};

export type SaveQuizPayload = {
  // Missing when the quiz has not been created yet
  slug?: string;
  settings: QuizSettings;
  questions: EditorQuestion[];
};

// Database ids of everything that was saved, by the editor's own keys
export type SavedIds = {
  questions: Record<string, number>;
  options: Record<string, number>;
};
