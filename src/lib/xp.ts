import { difficultyInfo, type Difficulty } from "@/lib/difficulty";

export const XP_PER_CORRECT_ANSWER = 10;
export const PERFECT_SCORE_BONUS_RATE = 0.2;

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
