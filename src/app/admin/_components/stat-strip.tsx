import { cn } from "@/lib/utils";

export type StripStat = {
  label: string;
  value: string;
  hint?: string;
  warn?: boolean;
};

// Three compact numbers that sit in the toolbar of an admin page.
export function StatStrip({ stats }: { stats: StripStat[] }) {
  return (
    <dl className="grid w-full grid-cols-3 divide-x rounded-2xl border bg-card shadow-xs sm:w-auto sm:min-w-md">
      {stats.map((stat) => (
        <div key={stat.label} title={stat.hint} className="min-w-0 px-5 py-3">
          <dt className="truncate text-xs text-muted-foreground">
            {stat.label}
          </dt>
          <dd
            className={cn(
              "mt-1.5 font-display text-2xl leading-none font-bold tabular-nums",
              stat.warn && "text-streak-ink",
            )}>
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
