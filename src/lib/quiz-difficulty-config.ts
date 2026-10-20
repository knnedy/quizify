import { QuizDifficulty } from "@/server/db/schema";

export const difficultyIcons = {
  BEGINNER: "🌱",
  INTERMEDIATE: "🌟",
  ADVANCED: "⚡",
  DEFAULT: "✨",
};

export const getDifficultyConfig = (
  difficulty: QuizDifficulty,
): { color: string; icon: string; bgColor: string } => {
  switch (difficulty) {
    case "BEGINNER":
      return {
        color: "text-emerald-700 dark:text-emerald-400",
        bgColor: "bg-emerald-100 dark:bg-emerald-900/40",
        icon: difficultyIcons.BEGINNER,
      };
    case "INTERMEDIATE":
      return {
        color: "text-amber-700 dark:text-amber-400",
        bgColor: "bg-amber-100 dark:bg-amber-900/40",
        icon: difficultyIcons.INTERMEDIATE,
      };
    case "ADVANCED":
      return {
        color: "text-rose-700 dark:text-rose-400",
        bgColor: "bg-rose-100 dark:bg-rose-900/40",
        icon: difficultyIcons.ADVANCED,
      };
    default:
      return {
        color: "text-slate-700 dark:text-slate-400",
        bgColor: "bg-slate-100 dark:bg-slate-900/40",
        icon: difficultyIcons.DEFAULT,
      };
  }
};
