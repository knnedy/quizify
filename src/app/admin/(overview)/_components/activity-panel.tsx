"use client";

import { useState } from "react";
import { Segmented } from "@/components/form/segmented";
import {
  formatAxis,
  formatValue,
  metrics,
  ranges,
  summarize,
  type DayPoint,
  type MetricKey,
  type RangeDays,
} from "../metrics";
import { AreaChart } from "./area-chart";
import { MetricTile } from "./metric-tile";

export function ActivityPanel({ days }: { days: DayPoint[] }) {
  const [range, setRange] = useState<RangeDays>(30);
  const [metricKey, setMetricKey] = useState<MetricKey>("plays");

  const selected = metrics.find((item) => item.key === metricKey) ?? metrics[0];

  const current = days.slice(-range).map((day) => ({
    date: day.date,
    value: day[selected.key],
  }));
  const previous = days.slice(-range * 2, -range).map((day) => ({
    date: day.date,
    value: day[selected.key],
  }));

  return (
    <section
      aria-labelledby="activity-heading"
      className="rounded-2xl border bg-card shadow-xs">
      <header className="flex flex-wrap items-center justify-between gap-3 p-5 sm:px-6 sm:pt-6">
        <div className="space-y-1">
          <h2 id="activity-heading" className="text-xl">
            Activity
          </h2>
          <p className="text-sm text-muted-foreground">
            The last {range} days, compared with the {range} before.
          </p>
        </div>

        <Segmented<RangeDays>
          label="Time range"
          value={range}
          options={ranges}
          onChange={setRange}
        />
      </header>

      <div
        role="group"
        aria-label="Choose a metric"
        className="grid grid-cols-2 gap-3 px-5 sm:px-6 lg:grid-cols-4">
        {metrics.map((config) => (
          <MetricTile
            key={config.key}
            config={config}
            summary={summarize(days, config, range)}
            range={range}
            selected={config.key === metricKey}
            onSelect={() => setMetricKey(config.key)}
          />
        ))}
      </div>

      <div className="p-5 pt-7 sm:p-6 sm:pt-8">
        <AreaChart
          key={`${metricKey}-${range}`}
          label={selected.chartLabel}
          current={current}
          previous={previous}
          mode={selected.domain}
          formatValue={(value) => formatValue(selected, value)}
          formatAxis={(value) => formatAxis(selected, value)}
        />
      </div>
    </section>
  );
}
