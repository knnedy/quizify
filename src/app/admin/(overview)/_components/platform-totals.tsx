import {
  BadgeCheckIcon,
  BookOpenIcon,
  PlayIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";
import type { TotalItem, TotalKey } from "../mock-data";

const icons: Record<TotalKey, LucideIcon> = {
  users: UsersIcon,
  creators: BadgeCheckIcon,
  quizzes: BookOpenIcon,
  plays: PlayIcon,
};

export function PlatformTotals({ totals }: { totals: TotalItem[] }) {
  return (
    <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border bg-border shadow-xs sm:grid-cols-2 lg:grid-cols-4">
      {totals.map((total) => {
        const Icon = icons[total.key];

        return (
          <div
            key={total.key}
            className="flex items-start gap-4 bg-card px-5 py-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Icon aria-hidden className="size-5" />
            </span>

            <div className="min-w-0">
              <dt className="text-xs text-muted-foreground">{total.label}</dt>
              <dd className="mt-1.5 font-display text-3xl leading-none font-bold tabular-nums">
                {total.value.toLocaleString("en-US")}
              </dd>
              <dd className="mt-1.5 text-xs text-muted-foreground">
                {total.note}
              </dd>
            </div>
          </div>
        );
      })}
    </dl>
  );
}
