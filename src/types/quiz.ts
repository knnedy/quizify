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
