import Link from "next/link";
import {
  ArrowRightIcon,
  BanIcon,
  EyeOffIcon,
  FlagIcon,
  SendIcon,
  ShieldAlertIcon,
  UserCheckIcon,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActivityEntry, ActivityKind } from "../mock-data";

const kinds: Record<ActivityKind, { Icon: LucideIcon; tone: string }> = {
  application: { Icon: UserCheckIcon, tone: "bg-primary-soft text-primary" },
  report: { Icon: FlagIcon, tone: "bg-streak-soft text-streak-ink" },
  hidden: { Icon: EyeOffIcon, tone: "bg-incorrect-soft text-incorrect-ink" },
  ban: { Icon: BanIcon, tone: "bg-incorrect-soft text-incorrect-ink" },
  published: { Icon: SendIcon, tone: "bg-correct-soft text-correct-ink" },
  suspended: { Icon: ShieldAlertIcon, tone: "bg-streak-soft text-streak-ink" },
};

function ago(minutes: number) {
  if (minutes < 60) return `${minutes} min ago`;

  if (minutes < 1440) {
    const hours = Math.floor(minutes / 60);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }

  const days = Math.round(minutes / 1440);
  return `${days} ${days === 1 ? "day" : "days"} ago`;
}

export function RecentActivity({ entries }: { entries: ActivityEntry[] }) {
  return (
    <section
      aria-labelledby="activity-feed-heading"
      className="rounded-2xl border bg-card p-5 shadow-xs sm:p-6">
      <div className="space-y-1">
        <h2 id="activity-feed-heading" className="text-xl">
          Recent activity
        </h2>
        <p className="text-sm text-muted-foreground">
          What has happened lately. Select an item to open it.
        </p>
      </div>

      <ul className="mt-4 space-y-0.5">
        {entries.map((entry) => {
          const { Icon, tone } = kinds[entry.kind];

          return (
            <li key={entry.id}>
              <Link
                href={entry.href}
                className="group -mx-2.5 flex items-center gap-3.5 rounded-xl p-2.5 transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-ring">
                <span
                  aria-hidden
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full",
                    tone,
                  )}>
                  <Icon className="size-4" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-sm leading-snug">
                    <span className="font-medium">{entry.actor}</span>{" "}
                    {entry.text}
                  </span>
                  <span className="block text-xs text-muted-foreground tabular-nums">
                    {ago(entry.minutesAgo)}
                  </span>
                </span>

                <ArrowRightIcon
                  aria-hidden
                  className="size-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100 group-focus-visible:opacity-100"
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
