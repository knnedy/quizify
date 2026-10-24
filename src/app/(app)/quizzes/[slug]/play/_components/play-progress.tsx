import { cn } from "@/lib/utils";
import type { PlayQuestion } from "../mock-data";

export function PlayProgress({
  questions,
  isAnswered,
  current,
  onJump,
}: {
  questions: PlayQuestion[];
  isAnswered: (questionId: number) => boolean;
  current: number;
  onJump: (index: number) => void;
}) {
  return (
    <nav aria-label="Questions">
      <ol className="flex gap-1.5">
        {questions.map((question, index) => {
          const answered = isAnswered(question.id);
          const isCurrent = index === current;

          return (
            <li key={question.id} className="flex-1">
              <button
                type="button"
                onClick={() => onJump(index)}
                aria-current={isCurrent ? "step" : undefined}
                aria-label={`Question ${index + 1}, ${answered ? "answered" : "not answered"}`}
                className="group flex h-7 w-full items-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                <span
                  className={cn(
                    "w-full rounded-full transition-all",
                    isCurrent
                      ? "h-3 bg-primary"
                      : cn(
                          "h-2 group-hover:h-3",
                          answered
                            ? "bg-primary/40 group-hover:bg-primary/60"
                            : "bg-muted-foreground/20 group-hover:bg-muted-foreground/35",
                        ),
                  )}
                />
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
