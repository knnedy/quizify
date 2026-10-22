import { difficultyInfo, type Difficulty } from "@/lib/difficulty";
import { cn } from "@/lib/utils";

export function DifficultyBars({
  difficulty,
  className,
}: {
  difficulty: Difficulty;
  className?: string;
}) {
  const { level } = difficultyInfo[difficulty];

  return (
    <span className={cn("flex items-end gap-0.5", className)} aria-hidden>
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={cn(
            "w-1 rounded-full",
            n === 1 ? "h-2" : n === 2 ? "h-3" : "h-4",
            n <= level ? "bg-foreground" : "bg-border",
          )}
        />
      ))}
    </span>
  );
}

export function DifficultyMeter({
  difficulty,
  className,
}: {
  difficulty: Difficulty;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <DifficultyBars difficulty={difficulty} />
      {difficultyInfo[difficulty].label}
    </span>
  );
}
