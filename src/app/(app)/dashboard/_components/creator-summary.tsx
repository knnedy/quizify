import type { ReactNode } from "react";
import { StarIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CreatorOverview } from "@/types/dashboard";

function Tile({
  label,
  note,
  children,
}: {
  label: string;
  note: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-xs">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-3 flex items-center gap-2 font-display text-3xl leading-none font-bold tabular-nums">
        {children}
      </dd>
      <dd className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        {note}
      </dd>
    </div>
  );
}

// Empty when the 30 days before had no plays, so there is nothing to compare
function DeltaNote({ delta }: { delta: number | null }) {
  if (delta === null) return <>Nothing to compare with yet</>;

  const up = delta >= 0;
  const Icon = up ? TrendingUpIcon : TrendingDownIcon;

  return (
    <>
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold tabular-nums",
          up
            ? "bg-correct-soft text-correct-ink"
            : "bg-incorrect-soft text-incorrect-ink",
        )}>
        <Icon aria-hidden className="size-3" />
        {up ? "+" : ""}
        {delta}%
      </span>
      vs the 30 days before
    </>
  );
}

export function CreatorSummary({ creator }: { creator: CreatorOverview }) {
  return (
    <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Tile label="Published quizzes" note="Live right now">
        {creator.published}
      </Tile>

      <Tile
        label="Plays, last 30 days"
        note={<DeltaNote delta={creator.plays30Delta} />}>
        {creator.plays30.toLocaleString("en-US")}
      </Tile>

      <Tile
        label="Average rating"
        note={
          creator.avgRating !== null
            ? `from ${creator.ratings.toLocaleString("en-US")} ratings`
            : "No ratings yet"
        }>
        {creator.avgRating !== null ? (
          <>
            <StarIcon aria-hidden className="size-6 fill-xp text-xp" />
            {creator.avgRating.toFixed(1)}
          </>
        ) : (
          "None"
        )}
      </Tile>

      <Tile label="Players, last 30 days" note="Other people who played">
        {creator.players30.toLocaleString("en-US")}
      </Tile>
    </dl>
  );
}
