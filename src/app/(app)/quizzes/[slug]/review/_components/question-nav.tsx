import { cn } from "@/lib/utils";
import type { ReviewQuestion, ReviewStatus } from "../mock-data";

const chipClasses: Record<ReviewStatus, string> = {
  correct:
    "border-correct/30 bg-correct-soft text-correct-ink hover:border-correct",
  incorrect:
    "border-incorrect/40 bg-incorrect-soft text-incorrect-ink hover:border-incorrect",
  skipped:
    "border-dashed bg-muted text-muted-foreground hover:border-foreground/30",
};

const statusLabels: Record<ReviewStatus, string> = {
  correct: "correct",
  incorrect: "incorrect",
  skipped: "not answered",
};

export function QuestionNav({ questions }: { questions: ReviewQuestion[] }) {
  return (
    <nav aria-label="Jump to a question">
      <ul className="flex flex-wrap gap-2">
        {questions.map((question) => (
          <li key={question.id}>
            <a
              href={`#question-${question.number}`}
              aria-label={`Question ${question.number}, ${statusLabels[question.status]}`}
              className={cn(
                "flex size-9 items-center justify-center rounded-lg border font-display text-sm font-bold tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                chipClasses[question.status],
              )}>
              {question.number}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
