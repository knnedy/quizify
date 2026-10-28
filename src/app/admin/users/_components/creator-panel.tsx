import Link from "next/link";
import { StarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CreatorStats, QuizState } from "../mock-data";
import { StatCell } from "./user-stats";

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const stateStyle: Record<QuizState, { label: string; tone: string }> = {
  PUBLISHED: { label: "Published", tone: "bg-correct-soft text-correct-ink" },
  DRAFT: { label: "Draft", tone: "bg-muted text-muted-foreground" },
  SUSPENDED: {
    label: "Suspended",
    tone: "bg-incorrect-soft text-incorrect-ink",
  },
  ARCHIVED: { label: "Archived", tone: "bg-muted text-muted-foreground" },
};

export function CreatorPanel({
  creator,
  former,
}: {
  creator: CreatorStats;
  former: boolean;
}) {
  return (
    <section aria-labelledby="creator-heading" className="space-y-4">
      <div className="space-y-1">
        <h3 id="creator-heading" className="text-base">
          {former
            ? "Quizzes from when they were a creator"
            : "Quizzes they publish"}
        </h3>
        <p className="text-sm text-muted-foreground tabular-nums">
          {creator.drafts} {creator.drafts === 1 ? "draft" : "drafts"} ·{" "}
          {creator.suspended} suspended
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-4">
        <StatCell label="Published">{creator.published}</StatCell>
        <StatCell label="Total plays">{compact.format(creator.plays)}</StatCell>
        <StatCell label="Average rating">
          {creator.avgRating !== null ? (
            <span className="flex items-center gap-1.5">
              <StarIcon aria-hidden className="size-5 fill-xp text-xp" />
              {creator.avgRating.toFixed(1)}
            </span>
          ) : (
            "None"
          )}
        </StatCell>
        <StatCell label="Open reports" warn={creator.openReports > 0}>
          {creator.openReports}
        </StatCell>
      </dl>

      <ul className="divide-y overflow-hidden rounded-xl border">
        {creator.quizzes.map((quiz) => {
          const style = stateStyle[quiz.status];

          return (
            <li
              key={`${quiz.slug}-${quiz.status}`}
              className="flex items-center gap-3 px-4 py-3">
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {quiz.status === "PUBLISHED" ? (
                  <Link
                    href={`/quizzes/${quiz.slug}`}
                    className="hover:underline">
                    {quiz.title}
                  </Link>
                ) : (
                  quiz.title
                )}
              </span>
              {quiz.plays > 0 && (
                <span className="text-xs text-muted-foreground tabular-nums">
                  {compact.format(quiz.plays)} plays
                </span>
              )}
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  style.tone,
                )}>
                {style.label}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
