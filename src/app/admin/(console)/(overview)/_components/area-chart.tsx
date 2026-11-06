"use client";

import { useState, type KeyboardEvent, type PointerEvent } from "react";

export type ChartPoint = { date: string; value: number };

const TICKS = 4;
const STEPS = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];

const shortDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const longDate = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

// A tick spacing that reads well on the axis: 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8,
// then the same times ten. Counts never need fractions, so small steps round up.
function tickStep(max: number) {
  const raw = Math.max(max / TICKS, 1);
  const exponent = 10 ** Math.floor(Math.log10(raw));
  const step = (STEPS.find((item) => item >= raw / exponent) ?? 10) * exponent;

  return step < 10 ? Math.ceil(step) : step;
}

function getDomain(values: number[], mode: "zero" | "fit"): [number, number] {
  const max = Math.max(...values, 0);

  if (mode === "zero") return [0, tickStep(max) * TICKS];

  // Percentages that sit in a narrow band would look flat from zero, so the
  // axis zooms to the data in steps of ten.
  const min = Math.min(...values);
  const low = Math.max(0, Math.floor((min - 3) / 10) * 10);
  const high = low + Math.ceil((max + 3 - low) / 40) * 40;

  return [low, high];
}

// Smooth S-curves between points, in a 0 to 100 box.
function linePath(
  values: number[],
  x: (index: number) => number,
  y: (value: number) => number,
) {
  return values
    .map((value, index) => {
      const px = x(index);
      const py = y(value);
      if (index === 0) return `M ${px} ${py}`;

      const previousX = x(index - 1);
      const previousY = y(values[index - 1]);
      const middle = (previousX + px) / 2;

      return `C ${middle} ${previousY}, ${middle} ${py}, ${px} ${py}`;
    })
    .join(" ");
}

export function AreaChart({
  label,
  current,
  previous,
  mode,
  formatValue,
  formatAxis,
}: {
  label: string;
  current: ChartPoint[];
  previous: ChartPoint[];
  mode: "zero" | "fit";
  formatValue: (value: number) => string;
  formatAxis: (value: number) => string;
}) {
  const [active, setActive] = useState<number | null>(null);

  const count = current.length;
  if (count === 0) return null;

  const [low, high] = getDomain(
    [...current, ...previous].map((point) => point.value),
    mode,
  );
  const span = high - low || 1;

  const x = (index: number) => (count > 1 ? (index / (count - 1)) * 100 : 50);
  const y = (value: number) =>
    Math.min(100, Math.max(0, 100 - ((value - low) / span) * 100));

  const currentLine = linePath(
    current.map((point) => point.value),
    x,
    y,
  );
  const previousLine = linePath(
    previous.map((point) => point.value),
    x,
    y,
  );
  const area = `${currentLine} L ${x(count - 1)} 100 L ${x(0)} 100 Z`;

  const ticks = Array.from({ length: TICKS + 1 }, (_, index) => ({
    value: low + (span / TICKS) * index,
    position: (index / TICKS) * 100,
  }));

  const labelIndexes = Array.from({ length: 5 }, (_, index) =>
    Math.round((index * (count - 1)) / 4),
  );

  const point = active !== null ? current[active] : null;
  const before = active !== null ? previous[active] : undefined;
  const position = active !== null ? x(active) : 0;

  function indexFromPointer(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;

    return Math.min(count - 1, Math.max(0, Math.round(ratio * (count - 1))));
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const last = count - 1;

    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        setActive((index) => (index === null ? last : Math.max(0, index - 1)));
        break;
      case "ArrowRight":
        event.preventDefault();
        setActive((index) => (index === null ? 0 : Math.min(last, index + 1)));
        break;
      case "Home":
        event.preventDefault();
        setActive(0);
        break;
      case "End":
        event.preventDefault();
        setActive(last);
        break;
      case "Escape":
        setActive(null);
        break;
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base">{label}</h3>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="h-0.5 w-4 rounded-full bg-primary" />
            This period
          </span>
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="w-4 border-t-2 border-dashed border-muted-foreground/50"
            />
            Previous period
          </span>
        </div>
      </div>

      <div className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-x-3 gap-y-2.5">
        <div aria-hidden className="relative h-64">
          {ticks.map((tick) => (
            <span
              key={tick.position}
              className="absolute right-0 translate-y-1/2 text-xs text-muted-foreground tabular-nums"
              style={{ bottom: `${tick.position}%` }}>
              {formatAxis(tick.value)}
            </span>
          ))}
        </div>

        <div
          role="group"
          tabIndex={0}
          aria-label={`${label}. Use the left and right arrow keys to read each day.`}
          onPointerMove={(event) => setActive(indexFromPointer(event))}
          onPointerDown={(event) => setActive(indexFromPointer(event))}
          onPointerLeave={() => setActive(null)}
          onKeyDown={onKeyDown}
          onBlur={() => setActive(null)}
          className="relative h-64 touch-pan-y rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden
            className="absolute inset-0 size-full overflow-visible">
            {ticks.map((tick) => (
              <line
                key={tick.position}
                x1="0"
                x2="100"
                y1={100 - tick.position}
                y2={100 - tick.position}
                className="stroke-border"
                strokeWidth="1"
                strokeDasharray="3 4"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            <path d={area} className="fill-primary/10" />
            <path
              d={previousLine}
              fill="none"
              className="stroke-muted-foreground/50"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={currentLine}
              fill="none"
              className="stroke-primary"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {point && active !== null && (
            <>
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 w-px bg-foreground/20"
                style={{ left: `${position}%` }}
              />
              {before && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-muted-foreground/70"
                  style={{ left: `${position}%`, top: `${y(before.value)}%` }}
                />
              )}
              <span
                aria-hidden
                className="pointer-events-none absolute size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-primary shadow-xs"
                style={{ left: `${position}%`, top: `${y(point.value)}%` }}
              />

              <div
                aria-hidden
                className="pointer-events-none absolute top-1 z-10 animate-in rounded-xl border bg-popover px-3 py-2 whitespace-nowrap text-popover-foreground shadow-md duration-100 fade-in-0"
                style={{
                  left: `${position}%`,
                  transform:
                    position < 50
                      ? "translateX(0.9rem)"
                      : "translateX(calc(-100% - 0.9rem))",
                }}>
                <p className="text-xs text-muted-foreground">
                  {longDate.format(new Date(point.date))}
                </p>
                <p className="mt-1 flex items-center gap-2 font-display text-lg leading-none font-bold tabular-nums">
                  <span className="size-2 rounded-full bg-primary" />
                  {formatValue(point.value)}
                </p>
                {before && (
                  <p className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground tabular-nums">
                    <span className="size-2 rounded-full bg-muted-foreground/60" />
                    {formatValue(before.value)} on{" "}
                    {shortDate.format(new Date(before.date))}
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        <span aria-hidden />
        <div
          aria-hidden
          className="flex justify-between text-xs text-muted-foreground tabular-nums">
          {labelIndexes.map((index) => (
            <span key={index}>
              {shortDate.format(new Date(current[index].date))}
            </span>
          ))}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {point
          ? `${longDate.format(new Date(point.date))}: ${formatValue(point.value)}`
          : ""}
      </p>
    </div>
  );
}
