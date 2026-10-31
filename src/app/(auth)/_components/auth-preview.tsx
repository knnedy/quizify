import { CheckIcon, FlameIcon, ZapIcon } from "lucide-react";
import { Keycap } from "@/components/keycap";
import { cn } from "@/lib/utils";

const segments = [
  "bg-correct",
  "bg-correct",
  "bg-correct",
  "bg-primary",
  "bg-border",
  "bg-border",
  "bg-border",
  "bg-border",
  "bg-border",
  "bg-border",
];

const options = [
  { letter: "A", label: "Mars", correct: false },
  { letter: "B", label: "Saturn", correct: true },
  { letter: "C", label: "Neptune", correct: false },
];

export function AuthPreview() {
  return (
    <div aria-hidden className="max-w-sm space-y-4">
      <div className="space-y-5 rounded-2xl border bg-card p-6 shadow-sm">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-muted-foreground">
              Question 4 of 10
            </span>
            <span className="font-semibold text-muted-foreground tabular-nums">
              0:12
            </span>
          </div>
          <div className="flex gap-1.5">
            {segments.map((bg, i) => (
              <span key={i} className={cn("h-1.5 flex-1 rounded-full", bg)} />
            ))}
          </div>
        </div>

        <p className="font-display text-xl leading-snug font-bold">
          Which planet has the most known moons?
        </p>

        <div className="space-y-2">
          {options.map((option) => (
            <div
              key={option.letter}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium",
                option.correct
                  ? "border-correct/40 bg-correct-soft text-correct-ink"
                  : "bg-card text-muted-foreground",
              )}>
              <Keycap
                className={cn(
                  option.correct && "border-correct bg-correct text-white",
                )}>
                {option.correct ? (
                  <CheckIcon className="size-3.5 stroke-3" />
                ) : (
                  option.letter
                )}
              </Keycap>
              {option.label}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-xp-soft px-3 py-1 text-sm font-semibold text-xp-ink">
          <ZapIcon className="size-4" />
          +50 XP
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-streak-soft px-3 py-1 text-sm font-semibold text-streak-ink">
          <FlameIcon className="size-4" />5 day streak
        </span>
      </div>
    </div>
  );
}
