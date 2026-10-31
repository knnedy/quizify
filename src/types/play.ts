export type QuestionType = "SINGLE" | "MULTIPLE" | "TRUE_FALSE";

export type PlayOption = {
  id: number;
  label: string;
};

export type PlayQuestion = {
  id: number;
  type: QuestionType;
  title: string;
  options: PlayOption[];
};

export type PlayQuiz = {
  attemptId: number;
  slug: string;
  title: string;
  timeLimitSeconds: number | null;
  secondsRemaining: number | null;
  questions: PlayQuestion[];
  answers: Record<number, number[]>;
};
