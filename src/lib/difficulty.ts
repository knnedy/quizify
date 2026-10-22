export const difficulties = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;

export type Difficulty = (typeof difficulties)[number];

export const difficultyInfo: Record<
  Difficulty,
  { label: string; level: 1 | 2 | 3 }
> = {
  BEGINNER: { label: "Beginner", level: 1 },
  INTERMEDIATE: { label: "Intermediate", level: 2 },
  ADVANCED: { label: "Advanced", level: 3 },
};

export function isDifficulty(value: string | undefined): value is Difficulty {
  return difficulties.some((difficulty) => difficulty === value);
}
