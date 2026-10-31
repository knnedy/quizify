import { difficultyInfo, type Difficulty } from "@/lib/difficulty";

export const XP_PER_CORRECT_ANSWER = 10;
export const PERFECT_SCORE_BONUS_RATE = 0.2;

// Streak bonus tiers, highest first. The rate is a share of the base XP.
const STREAK_BONUS_TIERS = [
  { days: 30, rate: 0.5 },
  { days: 14, rate: 0.35 },
  { days: 7, rate: 0.2 },
  { days: 3, rate: 0.1 },
] as const;

export type XpBreakdown = {
  base: number;
  perfect: number;
  streak: number;
  total: number;
};

// XP from correct answers: 10 each, times the difficulty level
export function baseXp(correct: number, difficulty: Difficulty) {
  return correct * XP_PER_CORRECT_ANSWER * difficultyInfo[difficulty].level;
}

export function perfectScoreBonus(questions: number, difficulty: Difficulty) {
  return Math.round(baseXp(questions, difficulty) * PERFECT_SCORE_BONUS_RATE);
}

// The most a quiz can pay before any streak bonus
export function maxQuizXp(questions: number, difficulty: Difficulty) {
  return (
    baseXp(questions, difficulty) + perfectScoreBonus(questions, difficulty)
  );
}

export function streakBonusRate(streakDays: number) {
  return STREAK_BONUS_TIERS.find((tier) => streakDays >= tier.days)?.rate ?? 0;
}

export function calculateXp({
  correct,
  total,
  difficulty,
  streakDays,
}: {
  correct: number;
  total: number;
  difficulty: Difficulty;
  streakDays: number;
}): XpBreakdown {
  const base = baseXp(correct, difficulty);
  const perfect =
    total > 0 && correct === total ? perfectScoreBonus(total, difficulty) : 0;
  const streak = Math.round(base * streakBonusRate(streakDays));

  return { base, perfect, streak, total: base + perfect + streak };
}
