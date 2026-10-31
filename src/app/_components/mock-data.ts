import {
  ClapperboardIcon,
  CpuIcon,
  FlaskConicalIcon,
  GlobeIcon,
  LandmarkIcon,
  MusicIcon,
  TrophyIcon,
  UtensilsIcon,
  type LucideIcon,
} from "lucide-react";

export type MockQuiz = {
  slug: string;
  title: string;
  description: string;
  category: string;
  level: 1 | 2 | 3;
  levelLabel: "Beginner" | "Intermediate" | "Advanced";
  questions: number;
  minutes: number;
  rating: number;
  plays: number;
  author: string;
  icon: LucideIcon;
};

export const trendingQuizzes: MockQuiz[] = [
  {
    slug: "capital-cities-of-africa",
    title: "Capital cities of Africa",
    description:
      "Match every capital to its country, from Nairobi to Windhoek.",
    category: "Geography",
    level: 1,
    levelLabel: "Beginner",
    questions: 12,
    minutes: 6,
    rating: 4.8,
    plays: 4812,
    author: "Amina W.",
    icon: GlobeIcon,
  },
  {
    slug: "solar-system-essentials",
    title: "Solar system essentials",
    description: "From the rocky inner planets to the ice giants at the edge.",
    category: "Science",
    level: 2,
    levelLabel: "Intermediate",
    questions: 10,
    minutes: 5,
    rating: 4.6,
    plays: 3120,
    author: "Brian O.",
    icon: FlaskConicalIcon,
  },
  {
    slug: "the-scramble-for-africa",
    title: "The scramble for Africa",
    description:
      "Treaties, borders and resistance movements, with no easy answers.",
    category: "History",
    level: 3,
    levelLabel: "Advanced",
    questions: 20,
    minutes: 15,
    rating: 4.4,
    plays: 1290,
    author: "Wanjiku M.",
    icon: LandmarkIcon,
  },
  {
    slug: "javascript-gotchas",
    title: "JavaScript gotchas",
    description: "Hoisting, coercion and closures. Can you predict the output?",
    category: "Technology",
    level: 2,
    levelLabel: "Intermediate",
    questions: 15,
    minutes: 10,
    rating: 4.7,
    plays: 5240,
    author: "Kevin N.",
    icon: CpuIcon,
  },
  {
    slug: "name-that-chord",
    title: "Name that chord",
    description: "Major, minor, seventh. Test your ear and your theory.",
    category: "Music",
    level: 1,
    levelLabel: "Beginner",
    questions: 10,
    minutes: 5,
    rating: 4.5,
    plays: 980,
    author: "Zawadi K.",
    icon: MusicIcon,
  },
  {
    slug: "world-cup-trivia",
    title: "World Cup trivia",
    description: "Finals, upsets and golden boots from every tournament.",
    category: "Sports",
    level: 1,
    levelLabel: "Beginner",
    questions: 15,
    minutes: 8,
    rating: 4.7,
    plays: 6015,
    author: "Otieno J.",
    icon: TrophyIcon,
  },
];

export const topics: {
  name: string;
  slug: string;
  quizzes: number;
  icon: LucideIcon;
}[] = [
  { name: "Geography", slug: "geography", quizzes: 24, icon: GlobeIcon },
  { name: "Science", slug: "science", quizzes: 31, icon: FlaskConicalIcon },
  { name: "History", slug: "history", quizzes: 18, icon: LandmarkIcon },
  { name: "Technology", slug: "technology", quizzes: 27, icon: CpuIcon },
  { name: "Music", slug: "music", quizzes: 12, icon: MusicIcon },
  { name: "Sports", slug: "sports", quizzes: 15, icon: TrophyIcon },
  { name: "Movies", slug: "movies", quizzes: 21, icon: ClapperboardIcon },
  { name: "Food", slug: "food", quizzes: 9, icon: UtensilsIcon },
];

export const stats = [
  { value: 1240, label: "quizzes to play" },
  { value: 18500, label: "players" },
  { value: 310000, label: "questions answered" },
];

export const leaderboard = [
  { rank: 1, name: "Amina W.", xp: 12480, isYou: false },
  { rank: 2, name: "Brian O.", xp: 11920, isYou: false },
  { rank: 3, name: "You", xp: 11405, isYou: true },
];
