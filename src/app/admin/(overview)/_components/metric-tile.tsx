import { MinusIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  describeDelta,
  formatValue,
  type DeltaDescription,
  type MetricConfig,
  type MetricSummary,
  type RangeDays,
} from "../metrics";

const deltaStyle: Record<DeltaDescription["direction"], string> = {
  up: "bg-correct-soft text-correct-ink",
  down: "bg-incorrect-soft text-incorrect-ink",
  flat: "bg-muted text-muted-foreground",
};

const deltaIcon = {
  up: TrendingUpIcon,
  down: TrendingDownIcon,
  flat: MinusIcon,
};

export function MetricTile({
  config,
  summary,
  range,
  selected,
  onSelect,
}: {
  config: MetricConfig;
  summary: MetricSummary;
  range: RangeDays;
  selected: boolean;
  onSelect: () => void;
}) {
  const delta = describeDelta(config, summary.delta);
  const DeltaIcon = delta ? deltaIcon[delta.direction] : null;

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "flex flex-col gap-3 rounded-xl border p-4 text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        selected
          ? "border-primary bg-primary-soft shadow-sm"
          : "bg-card hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-sm",
      )}>
      <span className="text-sm text-muted-foreground">{config.label}</span>
      <span className="font-display text-3xl leading-none font-bold tabular-nums">
        {formatValue(config, summary.value)}
      </span>

      <span className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs">
        {delta && DeltaIcon ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold tabular-nums",
              deltaStyle[delta.direction],
            )}>
            <DeltaIcon aria-hidden className="size-3" />
            {delta.text}
          </span>
        ) : (
          <span className="rounded-full bg-primary-soft px-2 py-0.5 font-semibold text-primary">
            New
          </span>
        )}
        <span className="text-muted-foreground">vs previous {range} days</span>
      </span>
    </button>
  );
}
