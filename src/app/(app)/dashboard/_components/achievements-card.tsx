import {
  FlameIcon,
  PenLineIcon,
  SparklesIcon,
  StarIcon,
  TargetIcon,
  TrophyIcon,
  ZapIcon,
  type LucideIcon,
} from "lucide-react";
import { XpChip } from "@/components/xp-chip";
import type { Achievement, AchievementIcon } from "../mock-data";

const icons: Record<AchievementIcon, LucideIcon> = {
  star: StarIcon,
  target: TargetIcon,
  trophy: TrophyIcon,
  flame: FlameIcon,
  sparkles: SparklesIcon,
  zap: ZapIcon,
  pen: PenLineIcon,
};

export function AchievementsCard({
  achievements,
}: {
  achievements: Achievement[];
}) {
  const unlocked = achievements.filter((item) => item.completed);
  const next = achievements
    .filter((item) => !item.completed)
    .sort((a, b) => b.progress / b.threshold - a.progress / a.threshold)
    .slice(0, 3);

  return (
    <section
      aria-labelledby="achievements-heading"
      className="rounded-2xl border bg-card p-5 shadow-xs sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 id="achievements-heading" className="text-xl">
            Achievements
          </h2>
          <p className="text-sm text-muted-foreground">
            The ones closest to unlocking.
          </p>
        </div>
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold tabular-nums">
          {unlocked.length} of {achievements.length}
        </span>
      </div>

      {next.length === 0 ? (
        <p className="mt-5 rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
          You&rsquo;ve unlocked every achievement.
        </p>
      ) : (
        <ul className="mt-5 space-y-5">
          {next.map((item) => {
            const Icon = icons[item.icon];
            const percentage = Math.round(
              (item.progress / item.threshold) * 100,
            );

            return (
              <li key={item.key} className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <Icon className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {item.title}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  </span>
                  <XpChip className="px-2.5 py-0.5 text-xs">
                    +{item.xpReward}
                  </XpChip>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    role="progressbar"
                    aria-label={item.title}
                    aria-valuemin={0}
                    aria-valuemax={item.threshold}
                    aria-valuenow={item.progress}
                    className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {item.progress.toLocaleString("en-US")} of{" "}
                    {item.threshold.toLocaleString("en-US")}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {unlocked.length > 0 && (
        <div className="mt-6 space-y-3 border-t pt-5">
          <h3 className="text-sm font-medium">Unlocked</h3>
          <ul className="flex flex-wrap gap-2">
            {unlocked.map((item) => {
              const Icon = icons[item.icon];

              return (
                <li
                  key={item.key}
                  title={item.description}
                  className="inline-flex items-center gap-1.5 rounded-full bg-correct-soft px-3 py-1 text-sm font-medium text-correct-ink">
                  <Icon aria-hidden className="size-3.5" />
                  {item.title}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
