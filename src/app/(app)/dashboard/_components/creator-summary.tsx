import type { ReactNode } from "react";
import { StarIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CreatorOverview } from "../mock-data";

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

export function CreatorSummary({ creator }: { creator: CreatorOverview }) {
  const up = creator.plays30Delta >= 0;
  const DeltaIcon = up ? TrendingUpIcon : TrendingDownIcon;

  return (
    <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Tile label="Published quizzes" note="Live right now">
        {creator.published}
      </Tile>

      <Tile
        label="Plays, last 30 days"
        note={
          <>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold tabular-nums",
                up
                  ? "bg-correct-soft text-correct-ink"
                  : "bg-incorrect-soft text-incorrect-ink",
              )}>
              <DeltaIcon aria-hidden className="size-3" />
              {up ? "+" : ""}
              {creator.plays30Delta}%
            </span>
            vs the 30 days before
          </>
        }>
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

      <Tile label="Players, last 30 days" note="Different people who played">
        {creator.players30.toLocaleString("en-US")}
      </Tile>
    </dl>
  );
}
