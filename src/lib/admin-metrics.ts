export type RangeDays = 7 | 30 | 90;
export type MetricKey = "plays" | "players" | "signups" | "score";

export type DayPoint = {
  date: string;
  plays: number;
  players: number;
  signups: number;
  // The day's average score. On a day nobody played it carries over from the
  // day before, so the chart doesn't fall to zero.
  score: number;
  // Every score of the day added up, so averages can be weighted by how much
  // was played
  scoreSum: number;
};

export type MetricConfig = {
  key: MetricKey;
  label: string;
  chartLabel: string;
  // "ratio" divides the scores added up by the quizzes played
  aggregate: "sum" | "average" | "ratio";
  unit: "count" | "percent";
  domain: "zero" | "fit";
};

export type MetricSummary = {
  value: number;
  previous: number;
  delta: number | null;
};

export type DeltaDescription = {
  text: string;
  direction: "up" | "down" | "flat";
};

export const ranges: { value: RangeDays; label: string }[] = [
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" },
];

export const metrics: MetricConfig[] = [
  {
    key: "plays",
    label: "Quizzes played",
    chartLabel: "Quizzes played each day",
    aggregate: "sum",
    unit: "count",
    domain: "zero",
  },
  {
    key: "players",
    label: "Daily players",
    chartLabel: "Players each day",
    aggregate: "average",
    unit: "count",
    domain: "zero",
  },
  {
    key: "signups",
    label: "New users",
    chartLabel: "New users each day",
    aggregate: "sum",
    unit: "count",
    domain: "zero",
  },
  {
    key: "score",
    label: "Average score",
    chartLabel: "Average score each day",
    aggregate: "ratio",
    unit: "percent",
    domain: "fit",
  },
];

function total(days: DayPoint[], pick: (day: DayPoint) => number) {
  return days.reduce((sum, day) => sum + pick(day), 0);
}

// Null when there is nothing to measure
function measure(days: DayPoint[], config: MetricConfig): number | null {
  if (days.length === 0) return null;

  switch (config.aggregate) {
    case "sum":
      return total(days, (day) => day[config.key]);
    case "average":
      return total(days, (day) => day[config.key]) / days.length;
    case "ratio": {
      const played = total(days, (day) => day.plays);
      return played === 0 ? null : total(days, (day) => day.scoreSum) / played;
    }
  }
}

// Compares the selected range with the same number of days right before it.
export function summarize(
  days: DayPoint[],
  config: MetricConfig,
  range: RangeDays,
): MetricSummary {
  const value = measure(days.slice(-range), config);
  const previous = measure(days.slice(-range * 2, -range), config);

  let delta: number | null = null;
  if (value !== null && previous !== null) {
    if (config.unit === "percent") delta = value - previous;
    else if (previous > 0) delta = ((value - previous) / previous) * 100;
  }

  return { value: value ?? 0, previous: previous ?? 0, delta };
}

export function formatValue(config: MetricConfig, value: number) {
  return config.unit === "percent"
    ? `${value.toFixed(1)}%`
    : Math.round(value).toLocaleString("en-US");
}

export function formatAxis(config: MetricConfig, value: number) {
  return config.unit === "percent"
    ? `${Math.round(value)}%`
    : Math.round(value).toLocaleString("en-US");
}

export function describeDelta(
  config: MetricConfig,
  delta: number | null,
): DeltaDescription | null {
  if (delta === null) return null;

  const rounded =
    config.unit === "percent" ? Math.round(delta * 10) / 10 : Math.round(delta);

  if (rounded === 0) return { text: "No change", direction: "flat" };

  const sign = rounded > 0 ? "+" : "-";
  const size = Math.abs(rounded);

  return {
    text: config.unit === "percent" ? `${sign}${size} pts` : `${sign}${size}%`,
    direction: rounded > 0 ? "up" : "down",
  };
}
