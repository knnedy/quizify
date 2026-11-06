export type RangeDays = 7 | 30 | 90;
export type MetricKey = "plays" | "players" | "signups" | "score";

export type DayPoint = {
  date: string;
  plays: number;
  players: number;
  signups: number;
  score: number;
};

export type MetricConfig = {
  key: MetricKey;
  label: string;
  chartLabel: string;
  aggregate: "sum" | "average";
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
    aggregate: "average",
    unit: "percent",
    domain: "fit",
  },
];

function aggregate(values: number[], mode: MetricConfig["aggregate"]) {
  if (values.length === 0) return 0;

  const total = values.reduce((sum, value) => sum + value, 0);
  return mode === "sum" ? total : total / values.length;
}

// Compares the selected range with the same number of days right before it.
export function summarize(
  days: DayPoint[],
  config: MetricConfig,
  range: RangeDays,
): MetricSummary {
  const current = days.slice(-range).map((day) => day[config.key]);
  const before = days.slice(-range * 2, -range).map((day) => day[config.key]);

  const value = aggregate(current, config.aggregate);
  const previous = aggregate(before, config.aggregate);

  let delta: number | null = null;
  if (before.length > 0) {
    if (config.unit === "percent") delta = value - previous;
    else if (previous > 0) delta = ((value - previous) / previous) * 100;
  }

  return { value, previous, delta };
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
