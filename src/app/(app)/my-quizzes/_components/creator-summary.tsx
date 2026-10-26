import { StarIcon } from "lucide-react";
import type { CreatorSummary as Summary } from "../mock-data";

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function Tile({
  label,
  children,
  note,
}: {
  label: string;
  children: React.ReactNode;
  note?: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-xs">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-3 flex items-center gap-2 font-display text-3xl leading-none font-bold tabular-nums">
        {children}
      </dd>
      {note && (
        <dd className="mt-2 text-sm text-muted-foreground tabular-nums">
          {note}
        </dd>
      )}
    </div>
  );
}

export function CreatorSummary({ summary }: { summary: Summary }) {
  return (
    <dl className="grid gap-4 sm:grid-cols-3">
      <Tile label="Published quizzes">{summary.published}</Tile>
      <Tile label="Total plays">{compact.format(summary.totalPlays)}</Tile>
      <Tile
        label="Average rating"
        note={
          summary.avgRating !== null
            ? `from ${summary.ratings.toLocaleString("en-US")} ratings`
            : "No ratings yet"
        }>
        {summary.avgRating !== null ? (
          <>
            <StarIcon className="size-6 fill-xp text-xp" />
            {summary.avgRating.toFixed(1)}
          </>
        ) : (
          "None"
        )}
      </Tile>
    </dl>
  );
}
