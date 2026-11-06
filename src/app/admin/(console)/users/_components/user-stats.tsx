import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { UserStats } from "../mock-data";

export function StatCell({
  label,
  note,
  warn = false,
  children,
}: {
  label: string;
  note?: string;
  warn?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="bg-card px-4 py-3.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "mt-2 font-display text-2xl leading-none font-bold tabular-nums",
          warn && "text-streak-ink",
        )}>
        {children}
      </dd>
      {note && (
        <dd className="mt-1.5 text-xs text-muted-foreground tabular-nums">
          {note}
        </dd>
      )}
    </div>
  );
}

export function UserStatsGrid({ stats }: { stats: UserStats }) {
  const streak = `${stats.currentStreak} ${stats.currentStreak === 1 ? "day" : "days"}`;

  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-4">
      <StatCell
        label="Quizzes completed"
        note={`${stats.perfectScores} perfect`}>
        {stats.completed}
      </StatCell>
      <StatCell label="Average score" note="across all attempts">
        {stats.averagePercentage === null
          ? "None"
          : `${stats.averagePercentage}%`}
      </StatCell>
      <StatCell label="Total XP">
        {stats.totalXp.toLocaleString("en-US")}
      </StatCell>
      <StatCell label="Current streak" note={`Best: ${stats.bestStreak} days`}>
        {streak}
      </StatCell>
    </dl>
  );
}
