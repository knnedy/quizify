import type { ComponentType } from "react";
import {
  BadgeCheckIcon,
  BadgeMinusIcon,
  BanIcon,
  ShieldCheckIcon,
  UserPlusIcon,
} from "lucide-react";
import { formatDate } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import type { HistoryEntry, HistoryKind } from "../mock-data";

type IconType = ComponentType<{ className?: string }>;

const kinds: Record<
  HistoryKind,
  { label: string; Icon: IconType; tone: string }
> = {
  JOINED: {
    label: "Joined Quizify",
    Icon: UserPlusIcon,
    tone: "bg-muted text-muted-foreground",
  },
  CREATOR_APPROVED: {
    label: "Became a creator",
    Icon: BadgeCheckIcon,
    tone: "bg-primary-soft text-primary",
  },
  CREATOR_REVOKED: {
    label: "Creator role removed",
    Icon: BadgeMinusIcon,
    tone: "bg-streak-soft text-streak-ink",
  },
  BANNED: {
    label: "Banned",
    Icon: BanIcon,
    tone: "bg-incorrect-soft text-incorrect-ink",
  },
  UNBANNED: {
    label: "Ban lifted",
    Icon: ShieldCheckIcon,
    tone: "bg-correct-soft text-correct-ink",
  },
};

export function ModerationHistory({ entries }: { entries: HistoryEntry[] }) {
  return (
    <section aria-labelledby="history-heading" className="space-y-4">
      <h3 id="history-heading" className="text-base">
        History
      </h3>

      <ol className="relative space-y-5 before:absolute before:inset-y-4 before:left-4 before:w-px before:bg-border">
        {entries.map((entry, index) => {
          const { label, Icon, tone } = kinds[entry.kind];
          const meta = [
            entry.by ? `by ${entry.by}` : null,
            entry.at ? formatDate(entry.at) : "just now",
          ]
            .filter(Boolean)
            .join(" · ");

          return (
            <li
              key={`${entry.kind}-${index}`}
              className="relative flex gap-3.5">
              <span
                className={cn(
                  "relative flex size-8 shrink-0 items-center justify-center rounded-full ring-4 ring-card",
                  tone,
                )}>
                <Icon aria-hidden className="size-4" />
              </span>
              <span className="min-w-0 space-y-0.5 pt-0.5">
                <span className="block text-sm font-medium">{label}</span>
                <span className="block text-sm text-muted-foreground">
                  {meta}
                </span>
                {entry.note && (
                  <span className="block pt-1 text-sm">{entry.note}</span>
                )}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
