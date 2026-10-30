import { getCategoryIcon } from "@/lib/category-icons";
import { cn } from "@/lib/utils";
import type { TopicRow } from "../mock-data";

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function TopicsCard({ topics }: { topics: TopicRow[] }) {
  const max = Math.max(...topics.map((topic) => topic.plays), 1);
  const total = topics.reduce((sum, topic) => sum + topic.plays, 0) || 1;

  return (
    <section
      aria-labelledby="topics-heading"
      className="rounded-2xl border bg-card p-5 shadow-xs sm:p-6">
      <div className="space-y-1">
        <h2 id="topics-heading" className="text-xl">
          Popular topics
        </h2>
        <p className="text-sm text-muted-foreground">
          Plays by category, all time.
        </p>
      </div>

      <ul className="mt-6 space-y-4">
        {topics.map((topic, index) => {
          const Icon = getCategoryIcon(topic.slug);
          const share = Math.round((topic.plays / total) * 100);

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
                    {topic.quizzes} {topic.quizzes === 1 ? "quiz" : "quizzes"}
                  </span>
                </span>
                <span className="text-sm text-muted-foreground tabular-nums">
                  <span className="font-medium text-foreground">
                    {compact.format(topic.plays)}
                  </span>{" "}
                  · {share}%
                </span>
              </div>

              <div
                aria-hidden
                className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full",
                    index === 0 ? "bg-primary" : "bg-primary/55",
                  )}
                  style={{ width: `${(topic.plays / max) * 100}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
