import { EyeOffIcon } from "lucide-react";
import { getCategoryIcon } from "@/lib/category-icons";
import { formatDate } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import type { ReportedQuiz, ReportStatus } from "../mock-data";
import { ReasonChip, reasonCounts } from "./reason-chip";
import { ago, oldestDays } from "./report-time";

export type ListRow = {
  item: ReportedQuiz;
  status: ReportStatus;
  justNow: boolean;
};

const resolvedTags: Record<
  Exclude<ReportStatus, "OPEN">,
  { label: string; tone: string }
> = {
  DISMISSED: { label: "Dismissed", tone: "bg-muted text-muted-foreground" },
  SUSPENDED: { label: "Suspended", tone: "bg-streak-soft text-streak-ink" },
  DELETED: { label: "Deleted", tone: "bg-incorrect-soft text-incorrect-ink" },
};

function timeLabel(row: ListRow) {
  if (row.status === "OPEN") return ago(oldestDays(row.item));
  if (row.justNow) return "Just now";
  return row.item.decision ? formatDate(row.item.decision.at) : "";
}

export function ReportList({
  rows,
  activeId,
  onSelect,
}: {
  rows: ListRow[];
  activeId: number;
  onSelect: (id: number) => void;
}) {
  return (
    <ul className="space-y-2.5">
      {rows.map((row) => {
        const { item } = row;
        const active = item.id === activeId;
        const open = row.status === "OPEN";
        const overdue = open && oldestDays(item) >= 5;
        const reasons = reasonCounts(item);
        const Icon = getCategoryIcon(item.quiz.category.slug);
        const count = item.reports.length;

        return (
          <li key={item.id}>
            <button
              type="button"
              aria-current={active ? "true" : undefined}
              onClick={() => onSelect(item.id)}
              className={cn(
                "flex w-full gap-3.5 rounded-2xl border bg-card p-4 text-left shadow-xs transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                active
                  ? "lg:border-primary lg:bg-primary-soft lg:shadow-sm"
                  : "hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-sm",
              )}>
              <span
                aria-hidden
                className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                <Icon className="size-5" />
              </span>

              <span className="min-w-0 flex-1 space-y-2">
                <span className="flex items-center justify-between gap-3">
                  <span className="truncate font-medium">
                    {item.quiz.title}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 text-xs tabular-nums",
                      overdue
                        ? "font-semibold text-streak-ink"
                        : "text-muted-foreground",
                    )}>
                    {timeLabel(row)}
                  </span>
                </span>

                <span className="flex flex-wrap items-center gap-1.5">
                  {reasons.slice(0, 2).map(({ reason }) => (
                    <ReasonChip key={reason} reason={reason} />
                  ))}
                  {reasons.length > 2 && (
                    <span className="text-xs text-muted-foreground">
                      +{reasons.length - 2}
                    </span>
                  )}
                </span>

                <span className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 text-xs text-muted-foreground tabular-nums">
                  <span className="truncate">
                    {count} {count === 1 ? "report" : "reports"} · by{" "}
                    {item.creator.name}
                  </span>

                  {open && item.hiddenAutomatically && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-incorrect-soft px-2 py-0.5 font-semibold text-incorrect-ink">
                      <EyeOffIcon aria-hidden className="size-3" />
                      Hidden
                    </span>
                  )}

                  {!open && (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 font-semibold",
                        resolvedTags[row.status as keyof typeof resolvedTags]
                          .tone,
                      )}>
                      {
                        resolvedTags[row.status as keyof typeof resolvedTags]
                          .label
                      }
                    </span>
                  )}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
