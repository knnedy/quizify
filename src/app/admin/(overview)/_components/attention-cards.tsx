import Link from "next/link";
import {
  ArrowRightIcon,
  BanIcon,
  CheckIcon,
  FlagIcon,
  UserCheckIcon,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AttentionItem, AttentionKey, AttentionTone } from "../mock-data";

const icons: Record<AttentionKey, LucideIcon> = {
  applications: UserCheckIcon,
  reports: FlagIcon,
  bans: BanIcon,
};

const tones: Record<
  AttentionTone,
  { tile: string; note: string; card: string }
> = {
  urgent: {
    tile: "bg-streak-soft text-streak-ink",
    note: "font-medium text-streak-ink",
    card: "border-streak/40",
  },
  normal: {
    tile: "bg-primary-soft text-primary",
    note: "text-muted-foreground",
    card: "",
  },
  clear: {
    tile: "bg-correct-soft text-correct-ink",
    note: "text-muted-foreground",
    card: "",
  },
};

export function AttentionCards({ items }: { items: AttentionItem[] }) {
  const waiting = items.filter((item) => item.count > 0).length;

  return (
    <section aria-labelledby="attention-heading" className="space-y-4">
      <div className="space-y-1">
        <h2 id="attention-heading" className="text-xl">
          {waiting === 0 ? "You're all caught up" : "Needs your attention"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {waiting === 0
            ? "Nothing is waiting for a decision right now."
            : "The queues that are waiting for a decision."}
        </p>
      </div>

      <ul className="grid gap-4 md:grid-cols-3">
        {items.map((item) => {
          const tone = tones[item.tone];
          const clear = item.tone === "clear";
          const Icon = clear ? CheckIcon : icons[item.key];

          return (
            <li key={item.key}>
              <Link
                href={item.href}
                className={cn(
                  "group flex h-full flex-col gap-5 rounded-2xl border bg-card p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  tone.card,
                )}>
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={cn(
                      "flex size-11 items-center justify-center rounded-xl",
                      tone.tile,
                    )}>
                    <Icon aria-hidden className="size-5" />
                  </span>

                  {item.tone === "urgent" && (
                    <span className="rounded-full bg-streak-soft px-2.5 py-0.5 text-xs font-semibold text-streak-ink">
                      Needs a look
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p
                    className={cn(
                      "flex h-12 items-center font-display font-bold tabular-nums",
                      clear
                        ? "text-3xl text-correct-ink"
                        : "text-5xl leading-none",
                    )}>
                    {clear ? "All clear" : item.count}
                  </p>
                  <p className={cn("text-sm", tone.note)}>{item.note}</p>
                </div>

                <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  {item.cta}
                  <ArrowRightIcon
                    aria-hidden
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
