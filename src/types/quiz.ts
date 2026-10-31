import type { Difficulty } from "@/lib/difficulty";

export type QuizCardData = {
  slug: string;
  title: string;
  description: string;
  category: { name: string; slug: string };
  difficulty: Difficulty;
  questions: number;
  timeLimitMinutes: number | null;
  avgRating: number | null;
  ratings: number;
  plays: number;
  author: { name: string } | null;
  isBookmarked: boolean;
};

export type QuizList = {
  items: QuizCardData[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type CategoryWithCount = {
  name: string;
  slug: string;
  count: number;
};

export type RatingBucket = { stars: number; count: number };

export type LeaderboardEntry = {
  rank: number;
  name: string;
  score: number;
  timeSeconds: number;
  isYou: boolean;
};

export type LeaderboardView = {
  top: LeaderboardEntry[];
  pinned: LeaderboardEntry | null;
};

export type BestResult = {
  score: number;
  total: number;
  percentage: number;
  timeSeconds: number;
  rank: number;
  xpEarned: number;
  attempts: number;
  lastPlayedAt: Date;
};

export type QuizDetail = QuizCardData & {
  tags: string[];
  publishedAt: Date;
  xpReward: number;
  distribution: RatingBucket[];
  leaderboard: LeaderboardView;
  best: BestResult | null;
  related: QuizCardData[];
  isOwner: boolean;
  hasReported: boolean;
  maxAttempts: number | null;
  attemptsUsed: number;
  hasActiveAttempt: boolean;
};
