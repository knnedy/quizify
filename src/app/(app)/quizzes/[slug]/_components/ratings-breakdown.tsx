import { StarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RatingBucket } from "../mock-data";

export function RatingsBreakdown({
  average,
  count,
  distribution,
}: {
  average: number | null;
  count: number;
  distribution: RatingBucket[];
}) {
  return (
    <section aria-labelledby="ratings-heading" className="space-y-4">
      <h2 id="ratings-heading" className="text-2xl">
        Ratings
      </h2>

      {average === null || count === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-10 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-muted">
            <StarIcon className="size-5 text-muted-foreground" />
          </span>
          <div className="space-y-1">
            <p className="font-medium">No ratings yet</p>
            <p className="text-sm text-muted-foreground">
              Finish the quiz and be the first to rate it.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 rounded-2xl border bg-card p-6 shadow-xs sm:grid-cols-[10rem_1fr] sm:items-center">
          <div className="space-y-2">
            <p className="font-display text-5xl leading-none font-bold tabular-nums">
              {average.toFixed(1)}
            </p>
            <div
              role="img"
              aria-label={`${average.toFixed(1)} out of 5`}
              className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <StarIcon
                  key={n}
                  className={cn(
                    "size-4",
                    n <= Math.round(average)
                      ? "fill-xp text-xp"
                      : "text-border",
                  )}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground tabular-nums">
              {count.toLocaleString("en-US")} ratings
            </p>
          </div>

          <ul className="space-y-2">
            {distribution.map((bucket) => (
              <li
                key={bucket.stars}
                className="flex items-center gap-3 text-sm tabular-nums">
                <span className="flex w-7 items-center gap-0.5 text-muted-foreground">
                  {bucket.stars}
                  <StarIcon className="size-3.5" />
                </span>
                <span
                  aria-hidden
                  className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <span
                    className="block h-full rounded-full bg-xp"
                    style={{ width: `${(bucket.count / count) * 100}%` }}
                  />
                </span>
                <span className="w-10 text-right text-muted-foreground">
                  {bucket.count}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
