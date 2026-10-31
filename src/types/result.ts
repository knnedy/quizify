import type { QuizCardData } from "@/types/quiz";

export type ResultStatus = "COMPLETED" | "TIMED_OUT";

export type XpLine = {
  label: string;
  detail?: string;
  amount: number;
};

export type QuizResult = {
  slug: string;
  title: string;
  status: ResultStatus;
  score: number;
  total: number;
  answered: number;
  percentage: number;
  timeSeconds: number;
  timeLimitSeconds: number | null;
  rank: number;
  players: number;
  previousBest: number | null;
  isNewBest: boolean;
  canPlayAgain: boolean;
  isOwner: boolean;
  xpLines: XpLine[];
  xpTotal: number;
  myRating: number | null;
  category: { name: string; slug: string };
  related: QuizCardData[];
};
