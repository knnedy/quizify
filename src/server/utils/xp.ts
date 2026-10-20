import { QuizDifficulty } from "@/server/db/schema";

// Enhanced XP Configuration
export const XP_CONFIG = {
  // Baseline configuration
  QUESTION_COUNT_BASELINE: 10,

  // Valid difficulties for validation
  VALID_DIFFICULTIES: ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const,

  BASE_XP: {
    BEGINNER: 10,
    INTERMEDIATE: 20,
    ADVANCED: 30,
  },

  SCORE_MULTIPLIERS: {
    PERFECT: 1.5, // 100%
    EXCELLENT: 1.25, // 90-99%
    GOOD: 1.0, // 70-89%
    PASS: 0.75, // 50-69%
    FAIL: 0.25, // Below 50%
  },

  // More granular time bonus system
  TIME_BONUS: {
    LIGHTNING: 1.5, // < 30% of time
    FAST: 1.25, // 30-50% of time
    NORMAL: 1.0, // 50-80% of time
    SLOW: 0.75, // > 80% of time
  },

  // Improved streak bonus with thresholds
  STREAK_BONUS: {
    THRESHOLDS: [
      { days: 3, bonus: 0.1 }, // 10% at 3 days
      { days: 7, bonus: 0.2 }, // 20% at 1 week
      { days: 14, bonus: 0.35 }, // 35% at 2 weeks
      { days: 30, bonus: 0.5 }, // 50% at 1 month
    ],
    MAX_BONUS: 0.5,
  },

  PERFECT_SCORE_BONUS: 50,
  MIN_XP: 25,

  // Achievement thresholds
  ACHIEVEMENTS: {
    QUIZ_MASTER: {
      BRONZE: 10, // Complete 10 quizzes
      SILVER: 50, // Complete 50 quizzes
      GOLD: 100, // Complete 100 quizzes
    },
    PERFECT_SCORER: {
      BRONZE: 5, // Get 5 perfect scores
      SILVER: 25, // Get 25 perfect scores
      GOLD: 50, // Get 50 perfect scores
    },
    SPEED_DEMON: {
      BRONZE: 5, // Complete 5 quizzes under 30% time
      SILVER: 25, // Complete 25 quizzes under 30% time
      GOLD: 50, // Complete 50 quizzes under 30% time
    },
  },
};

// Type definitions
interface XPCalculationParams {
  difficulty: QuizDifficulty;
  scorePercentage: number;
  timeLimit: number;
  timeTaken: number;
  currentStreak: number;
  questionCount: number;
}

interface XPBreakdown {
  baseXP: number;
  scoreMultiplier: number;
  timeMultiplier: number;
  streakBonus: number;
  perfectBonus: number;
  questionScaling: number;
  finalXP: number;
}

interface XPResult {
  xp: number;
  breakdown: XPBreakdown;
}

// Validation functions
function validateDifficulty(difficulty: QuizDifficulty): void {
  if (!Object.keys(XP_CONFIG.BASE_XP).includes(difficulty)) {
    throw new Error(
      `Invalid difficulty: ${difficulty}. Must be one of: ${XP_CONFIG.VALID_DIFFICULTIES.join(
        ", ",
      )}`,
    );
  }
}

function validateInputs(params: XPCalculationParams): void {
  const {
    scorePercentage,
    timeLimit,
    timeTaken,
    currentStreak,
    questionCount,
  } = params;

  if (scorePercentage < 0 || scorePercentage > 100) {
    throw new Error("Score percentage must be between 0 and 100");
  }

  if (timeTaken < 0 || timeLimit < 0) {
    throw new Error("Time values cannot be negative");
  }

  if (questionCount <= 0) {
    throw new Error("Question count must be positive");
  }

  if (currentStreak < 0) {
    throw new Error("Current streak cannot be negative");
  }

  validateDifficulty(params.difficulty);
}

// Core calculation functions
export function getScoreMultiplier(scorePercentage: number): number {
  if (scorePercentage === 100) return XP_CONFIG.SCORE_MULTIPLIERS.PERFECT;
  if (scorePercentage >= 90) return XP_CONFIG.SCORE_MULTIPLIERS.EXCELLENT;
  if (scorePercentage >= 70) return XP_CONFIG.SCORE_MULTIPLIERS.GOOD;
  if (scorePercentage >= 50) return XP_CONFIG.SCORE_MULTIPLIERS.PASS;
  return XP_CONFIG.SCORE_MULTIPLIERS.FAIL;
}

export function getTimeMultiplier(
  timeLimit: number,
  timeTaken: number,
): number {
  // No time pressure = no bonus/penalty
  if (timeLimit <= 0) return 1.0;

  const timeRatio = Math.max(0, timeTaken) / timeLimit;

  if (timeRatio < 0.3) return XP_CONFIG.TIME_BONUS.LIGHTNING;
  if (timeRatio < 0.5) return XP_CONFIG.TIME_BONUS.FAST;
  if (timeRatio < 0.8) return XP_CONFIG.TIME_BONUS.NORMAL;
  return XP_CONFIG.TIME_BONUS.SLOW;
}

export function getStreakBonus(streak: number): number {
  if (streak <= 0) return 0;

  // Find the highest threshold the streak qualifies for
  const threshold = XP_CONFIG.STREAK_BONUS.THRESHOLDS.slice()
    .reverse()
    .find((t) => streak >= t.days);

  return threshold?.bonus || 0;
}

function getQuestionCountScaling(questionCount: number): number {
  // Handle very short quizzes differently to prevent unfair penalties
  if (questionCount < 5) {
    return Math.max(0.5, questionCount / XP_CONFIG.QUESTION_COUNT_BASELINE);
  }

  return questionCount / XP_CONFIG.QUESTION_COUNT_BASELINE;
}

// Main XP calculation function with breakdown
export async function calculateXPWithBreakdown(
  params: XPCalculationParams,
): Promise<XPResult> {
  // Validate all inputs
  validateInputs(params);

  const {
    difficulty,
    scorePercentage,
    timeLimit,
    timeTaken,
    currentStreak,
    questionCount,
  } = params;

  // 1. Base XP
  const baseXP = XP_CONFIG.BASE_XP[difficulty];

  // 2. Score multiplier
  const scoreMultiplier = getScoreMultiplier(scorePercentage);

  // 3. Time multiplier
  const timeMultiplier = getTimeMultiplier(timeLimit, timeTaken);

  // 4. Streak bonus
  const streakBonus = getStreakBonus(currentStreak);

  // 5. Question count scaling
  const questionScaling = getQuestionCountScaling(questionCount);

  // Calculate XP step by step
  let xp = baseXP;
  xp *= scoreMultiplier;
  xp *= timeMultiplier;
  xp *= 1 + streakBonus;

  // 6. Perfect score bonus (applied before scaling)
  const perfectBonus =
    scorePercentage === 100 ? XP_CONFIG.PERFECT_SCORE_BONUS : 0;
  xp += perfectBonus;

  // 7. Apply question count scaling
  xp *= questionScaling;

  // 8. Ensure minimum XP and round
  const finalXP = Math.max(Math.round(xp), XP_CONFIG.MIN_XP);

  const breakdown: XPBreakdown = {
    baseXP,
    scoreMultiplier,
    timeMultiplier,
    streakBonus,
    perfectBonus,
    questionScaling,
    finalXP,
  };

  return {
    xp: finalXP,
    breakdown,
  };
}

// Simplified function that returns only XP
export async function calculateXP(
  params: XPCalculationParams,
): Promise<number> {
  const result = await calculateXPWithBreakdown(params);
  return result.xp;
}

// Utility function to get XP breakdown as a readable summary
export function formatXPBreakdown(breakdown: XPBreakdown): string {
  const parts = [
    `Base XP: ${breakdown.baseXP}`,
    `Score Multiplier: ${breakdown.scoreMultiplier}x`,
    `Time Multiplier: ${breakdown.timeMultiplier}x`,
  ];

  if (breakdown.streakBonus > 0) {
    parts.push(`Streak Bonus: +${Math.round(breakdown.streakBonus * 100)}%`);
  }

  if (breakdown.perfectBonus > 0) {
    parts.push(`Perfect Score Bonus: +${breakdown.perfectBonus}`);
  }

  parts.push(`Question Scaling: ${breakdown.questionScaling}x`);
  parts.push(`Final XP: ${breakdown.finalXP}`);

  return parts.join(" | ");
}

// Helper function to check if a score qualifies for achievements
export function checkSpeedAchievement(
  timeLimit: number,
  timeTaken: number,
): boolean {
  if (timeLimit <= 0) return false;
  const timeRatio = timeTaken / timeLimit;
  return timeRatio < 0.3; // Lightning fast threshold
}

// Export types for external use
export type { XPCalculationParams, XPBreakdown, XPResult };
