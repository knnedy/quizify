import Link from "next/link";
import {
  PlayIcon,
  SparklesIcon,
  StarIcon,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CreatorActivity, CreatorActivityKind } from "../mock-data";

const kinds: Record<CreatorActivityKind, { Icon: LucideIcon; tone: string }> = {
  play: { Icon: PlayIcon, tone: "bg-primary-soft text-primary" },
  rating: { Icon: StarIcon, tone: "bg-xp-soft text-xp-ink" },
  milestone: { Icon: SparklesIcon, tone: "bg-correct-soft text-correct-ink" },
};

function ago(minutes: number) {
  if (minutes < 60) return `${minutes} min ago`;

  if (minutes < 1440) {
    const hours = Math.floor(minutes / 60);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }

  const days = Math.round(minutes / 1440);
  return `${days} ${days === 1 ? "day" : "days"} ago`;
}

export function CreatorActivityFeed({
  entries,
}: {
  entries: CreatorActivity[];
}) {
  return (
    <section
      aria-labelledby="creator-activity-heading"
      className="rounded-2xl border bg-card p-5 shadow-xs sm:p-6">
      <div className="space-y-1">
        <h2 id="creator-activity-heading" className="text-xl">
          Recent activity
        </h2>
        <p className="text-sm text-muted-foreground">
          What players are doing with your quizzes.
        </p>
      </div>

      {entries.length === 0 ? (
        <p className="mt-5 rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
          Nothing yet. Plays and ratings show up here.
        </p>
      ) : (
        <ul className="mt-4 space-y-0.5">
          {entries.map((entry) => {
            const { Icon, tone } = kinds[entry.kind];

            return (
              <li key={entry.id}>
                <Link
                  href={`/quizzes/${entry.slug}`}
                  className="group -mx-2.5 flex items-center gap-3.5 rounded-xl p-2.5 transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-ring">
                  <span
                    aria-hidden
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-full",
                      tone,
                    )}>
                    <Icon className="size-4" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-sm leading-snug">
                      <span className="font-medium">{entry.actor}</span>{" "}
                      {entry.text}
                    </span>
                    <span className="block text-xs text-muted-foreground tabular-nums">
                      {ago(entry.minutesAgo)}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
