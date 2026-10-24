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
      <ol className="flex gap-1">
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
                className="group flex h-5 w-full items-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                <span
                  className={cn(
                    "h-1.5 w-full rounded-full transition-all group-hover:h-2",
                    isCurrent && "h-2",
                    isCurrent
                      ? "bg-primary"
                      : answered
                        ? "bg-primary/45"
                        : "bg-muted-foreground/25",
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
