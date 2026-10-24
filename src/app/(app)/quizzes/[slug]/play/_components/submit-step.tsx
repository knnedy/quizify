import { ArrowRightIcon } from "lucide-react";

export function SubmitStep({
  total,
  answered,
  unanswered,
  timed,
  onJump,
}: {
  total: number;
  answered: number;
  unanswered: { index: number; title: string }[];
  timed: boolean;
  onJump: (index: number) => void;
}) {
  const allAnswered = unanswered.length === 0;

  return (
    <div className="animate-in space-y-6 duration-200 fade-in slide-in-from-bottom-1">
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl">Ready to submit?</h2>
        <p className="text-muted-foreground">
          {allAnswered
            ? `You answered all ${total} questions. You can still go back and change any of them.`
            : `You answered ${answered} of ${total} questions. Unanswered questions count as incorrect.`}
        </p>
      </div>

      {!allAnswered && (
        <section aria-labelledby="unanswered-heading" className="space-y-3">
          <h3
            id="unanswered-heading"
            className="flex items-center gap-2 text-base">
            Unanswered
            <span className="rounded-full bg-streak-soft px-2.5 py-0.5 text-xs font-semibold text-streak-ink tabular-nums">
              {unanswered.length}
            </span>
          </h3>
          <ul className="max-h-72 divide-y overflow-y-auto rounded-xl border">
            {unanswered.map((item) => (
              <li key={item.index}>
                <button
                  type="button"
                  onClick={() => onJump(item.index)}
                  className="group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted font-display text-sm font-bold tabular-nums">
                    {item.index + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {item.title}
                  </span>
                  <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {timed && (
        <p className="text-sm text-muted-foreground">
          The timer is still running.
        </p>
      )}
    </div>
  );
}
