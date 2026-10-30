import {
  CircleCheckIcon,
  SparklesIcon,
  TargetIcon,
  ZapIcon,
  type LucideIcon,
} from "lucide-react";
import type { PlayerStats } from "../mock-data";

type Item = {
  key: string;
  label: string;
  value: string;
  note: string;
  Icon: LucideIcon;
  tone: string;
};

export function StatsStrip({ stats }: { stats: PlayerStats }) {
  const none = stats.completed === 0;

  const items: Item[] = [
    {
      key: "completed",
      label: "Quizzes completed",
      value: String(stats.completed),
      note:
        stats.thisWeek > 0 ? `${stats.thisWeek} this week` : "None this week",
      Icon: CircleCheckIcon,
      tone: "bg-primary-soft text-primary",
    },
    {
      key: "average",
      label: "Average score",
      value:
        stats.averagePercentage === null
          ? "None yet"
          : `${stats.averagePercentage}%`,
      note: none ? "Finish a quiz to get one" : "Across all attempts",
      Icon: TargetIcon,
      tone: "bg-correct-soft text-correct-ink",
    },
    {
      key: "xp",
      label: "Total XP",
      value: stats.totalXp.toLocaleString("en-US"),
      note: "Earned from quizzes",
      Icon: ZapIcon,
      tone: "bg-xp-soft text-xp-ink",
    },
    {
      key: "perfect",
      label: "Perfect scores",
      value: String(stats.perfectScores),
      note: "Every answer right",
      Icon: SparklesIcon,
      tone: "bg-streak-soft text-streak-ink",
    },
  ];

  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border shadow-xs lg:grid-cols-4">
      {items.map(({ key, label, value, note, Icon, tone }) => (
        <div key={key} className="flex items-start gap-4 bg-card px-5 py-4">
          <span
            className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
            <Icon aria-hidden className="size-5" />
          </span>

          <div className="min-w-0">
            <dt className="truncate text-xs text-muted-foreground">{label}</dt>
            <dd className="mt-1.5 font-display text-3xl leading-none font-bold tabular-nums">
              {value}
            </dd>
            <dd className="mt-1.5 truncate text-xs text-muted-foreground">
              {note}
            </dd>
          </div>
        </div>
      ))}
    </dl>
  );
}
