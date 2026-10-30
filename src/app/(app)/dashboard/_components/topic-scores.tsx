import { getCategoryIcon } from "@/lib/category-icons";
import { cn } from "@/lib/utils";
import type { TopicScore } from "../mock-data";

function barTone(percentage: number) {
  if (percentage >= 70) return "bg-correct";
  if (percentage >= 40) return "bg-xp";
  return "bg-incorrect";
}

export function TopicScores({ topics }: { topics: TopicScore[] }) {
  const ranked = [...topics].sort(
    (a, b) => b.averagePercentage - a.averagePercentage,
  );
  const strongest = ranked[0];
  const weakest = ranked.length > 1 ? ranked[ranked.length - 1] : null;

  return (
    <section
      aria-labelledby="topics-heading"
      className="rounded-2xl border bg-card p-5 shadow-xs sm:p-6">
      <div className="space-y-1">
        <h2 id="topics-heading" className="text-xl">
          How you do by topic
        </h2>
        <p className="text-sm text-muted-foreground">
          Your average score in each topic you play.
        </p>
      </div>

      {topics.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          Play a few quizzes and your strongest topics show up here.
        </p>
      ) : (
        <>
          <ul className="mt-6 space-y-4">
            {topics.map((topic) => {
              const Icon = getCategoryIcon(topic.slug);

              return (
                <li key={topic.slug} className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {topic.name}
                      </span>
                      <span className="block text-xs text-muted-foreground tabular-nums">
                        {topic.plays} {topic.plays === 1 ? "quiz" : "quizzes"}
                      </span>
                    </span>
                    <span className="font-display text-base font-bold tabular-nums">
                      {topic.averagePercentage}%
                    </span>
                  </div>

                  <div
                    aria-hidden
                    className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        barTone(topic.averagePercentage),
                      )}
                      style={{ width: `${topic.averagePercentage}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>

          {weakest && strongest.slug !== weakest.slug && (
            <p className="mt-6 border-t pt-4 text-sm text-muted-foreground">
              You&rsquo;re strongest in{" "}
              <span className="font-medium text-foreground">
                {strongest.name}
              </span>
              . {weakest.name} has the most room to grow.
            </p>
          )}
        </>
      )}
    </section>
  );
}
