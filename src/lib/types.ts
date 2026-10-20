import { PublicQuizOverview, QuizDifficulty } from "@/server/db/schema";

export type UserRecentAttempt = {
  id: number;
  title: string;
  category: string;
  dateTaken: string;
  percentage: number;
  timeTaken: number;
  difficulty: QuizDifficulty;
};

export type QuizBookmark = {
  id: number;
  createdAt: Date;
  quiz: PublicQuizOverview;
};

export type UserStats = {
  totalQuizzesTaken: number;
  averageScore: number;
  topCategory: string;
  completionRate: number;
  bestStreak: number;
  averageTimePerQuiz: number;
  totalXP: number;
  currentStreak: number;
};

export type CategoryPerformance = {
  name: string;
  score: number;
  quizzes: number;
};

export type WeeklyProgress = {
  day: string;
  fullDate: string;
  quizzes: number;
  score: number;
  xp: number;
};

export type UpdatedAchievement = {
  id: number;
  progress: number;
  isCompleted: boolean;
  completedAt?: Date | null;
}[];
