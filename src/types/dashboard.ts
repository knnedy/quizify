import type { QuizCardData } from "@/types/quiz";

export type DashboardView = "playing" | "creating";

export type StreakDay = { label: string; played: boolean; today: boolean };

export type Streak = {
  current: number;
  best: number;
  playedToday: boolean;
  days: StreakDay[];
};

export type PlayerStats = {
  completed: number;
  thisWeek: number;
  averagePercentage: number | null;
  totalXp: number;
  perfectScores: number;
};

export type InProgress = {
  slug: string;
  title: string;
  answered: number;
  total: number;
  secondsLeft: number | null;
};

export type RecentResult = {
  slug: string;
  title: string;
  category: { name: string; slug: string };
  score: number;
  total: number;
  percentage: number;
  daysAgo: number;
  xp: number;
};

export type TopicScore = {
  slug: string;
  name: string;
  plays: number;
  averagePercentage: number;
};

export type Achievement = {
  key: string;
  title: string;
  description: string;
  progress: number;
  threshold: number;
  xpReward: number;
  completed: boolean;
};

export type SavedQuiz = Pick<
  QuizCardData,
  "slug" | "title" | "category" | "difficulty" | "questions"
>;

export type Picks = {
  title: string;
  text: string;
  quizzes: QuizCardData[];
};

export type Eligibility = { completed: number; required: number };

export type AttentionItem = { slug: string; title: string; reason: string };

export type CreatorQuiz = {
  slug: string;
  title: string;
  category: { name: string; slug: string };
  plays: number;
  plays30: number;
  avgRating: number | null;
  ratings: number;
  finishRate: number | null;
  questions: number;
};

export type DraftQuiz = {
  slug: string;
  title: string;
  questions: number;
  note: string;
};

export type CreatorActivityKind = "play" | "rating";

export type CreatorActivity = {
  id: number;
  kind: CreatorActivityKind;
  actor: string;
  text: string;
  slug: string;
  minutesAgo: number;
};

export type CreatorOverview = {
  published: number;
  plays30: number;
  plays30Delta: number | null;
  players30: number;
  avgRating: number | null;
  ratings: number;
  series: { date: string; plays: number }[];
  quizzes: CreatorQuiz[];
  drafts: DraftQuiz[];
  attention: AttentionItem[];
  activity: CreatorActivity[];
};

export type Dashboard = {
  firstName: string;
  isNew: boolean;
  isCreator: boolean;
  totalXp: number;
  streak: Streak;
  stats: PlayerStats;
  inProgress: InProgress | null;
  suggestion: QuizCardData | null;
  recent: RecentResult[];
  topics: TopicScore[];
  achievements: Achievement[];
  saved: SavedQuiz[];
  picks: Picks;
  eligibility: Eligibility;
  creator: CreatorOverview | null;
};
