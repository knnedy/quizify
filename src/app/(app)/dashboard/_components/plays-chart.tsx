import { cn } from "@/lib/utils";

type Point = { date: string; plays: number };

const shortDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const longDay = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  timeZone: "UTC",
});

function tooltipAlignment(index: number, count: number) {
  if (index < 3) return "left-0";
  if (index > count - 4) return "right-0";
  return "left-1/2 -translate-x-1/2";
}

export function PlaysChart({ series }: { series: Point[] }) {
  if (series.length === 0) return null;

  const total = series.reduce((sum, point) => sum + point.plays, 0);
  const max = Math.max(...series.map((point) => point.plays), 1);
  const peak = series.reduce(
    (best, point) => (point.plays > best.plays ? point : best),
    series[0],
  );
  const middle = series[Math.floor(series.length / 2)];
  const last = series.length - 1;

  return (
    <section
      aria-labelledby="plays-heading"
      className="rounded-2xl border bg-card p-5 shadow-xs sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h2 id="plays-heading" className="text-xl">
            Plays on your quizzes
          </h2>
          <p className="text-sm text-muted-foreground">The last 14 days.</p>
        </div>

        <p className="font-display text-3xl leading-none font-bold tabular-nums">
          {total.toLocaleString("en-US")}
          <span className="ml-2 text-sm font-medium text-muted-foreground">
            plays
          </span>
        </p>
      </div>

      <div
        role="img"
        aria-label={`Plays per day for the last ${series.length} days, ${total} in total.`}
        className="mt-8 flex h-44 items-end gap-1.5 border-b">
        {series.map((point, index) => (
          <div
            key={point.date}
            className="group relative flex h-full flex-1 items-end">
            <span
              className={cn(
                "w-full rounded-t-md transition-colors",
                index === last
                  ? "bg-primary"
                  : "bg-primary/35 group-hover:bg-primary/60",
              )}
              style={{ height: `${Math.max(4, (point.plays / max) * 100)}%` }}
            />
            <span
              className={cn(
                "pointer-events-none absolute bottom-full z-10 mb-2 hidden rounded-lg border bg-popover px-2.5 py-1.5 text-xs whitespace-nowrap text-popover-foreground shadow-md group-hover:block",
                tooltipAlignment(index, series.length),
              )}>
              <span className="text-muted-foreground">
                {shortDate.format(new Date(point.date))}
              </span>{" "}
              <span className="font-semibold tabular-nums">
                {point.plays} plays
              </span>
            </span>
          </div>
        ))}
      </div>

      <div
        aria-hidden
        className="mt-2.5 flex justify-between text-xs text-muted-foreground tabular-nums">
        <span>{shortDate.format(new Date(series[0].date))}</span>
        <span>{shortDate.format(new Date(middle.date))}</span>
        <span>{shortDate.format(new Date(series[last].date))}</span>
      </div>

      <p className="mt-5 border-t pt-4 text-sm text-muted-foreground">
        Your best day was{" "}
        <span className="font-medium text-foreground">
          {longDay.format(new Date(peak.date))}
        </span>{" "}
        with {peak.plays} plays.
      </p>
    </section>
  );
}
