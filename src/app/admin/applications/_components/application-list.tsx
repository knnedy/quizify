import { TriangleAlertIcon } from "lucide-react";
import { formatDate } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import type { Application, ApplicationStatus } from "../mock-data";
import { getChecks } from "./application-checks";

export type ListRow = {
  application: Application;
  status: ApplicationStatus;
  justNow: boolean;
};

function ago(days: number) {
  if (days === 0) return "Today";
  return days === 1 ? "1 day ago" : `${days} days ago`;
}

function timeLabel(row: ListRow) {
  if (row.status === "PENDING") return ago(row.application.waitingDays);
  if (row.justNow) return "Just now";
  return row.application.decision
    ? formatDate(row.application.decision.reviewedAt)
    : "";
}

export function ApplicationList({
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
        const { application } = row;
        const active = application.id === activeId;
        const pending = row.status === "PENDING";
        const overdue = pending && application.waitingDays >= 5;
        const warnings = pending
          ? getChecks(application).filter((check) => !check.ok).length
          : 0;

        return (
          <li key={application.id}>
            <button
              type="button"
              aria-current={active ? "true" : undefined}
              onClick={() => onSelect(application.id)}
              className={cn(
                "flex w-full gap-3.5 rounded-2xl border bg-card p-4 text-left shadow-xs transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                active
                  ? "lg:border-primary lg:bg-primary-soft lg:shadow-sm"
                  : "hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-sm",
              )}>
              <span
                aria-hidden
                className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary font-display text-lg font-bold text-secondary-foreground">
                {application.applicant.name.charAt(0).toUpperCase()}
              </span>

              <span className="min-w-0 flex-1 space-y-2">
                <span className="flex items-center justify-between gap-3">
                  <span className="truncate font-medium">
                    {application.applicant.name}
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

                <span className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {application.motivation}
                </span>

                <span className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 text-xs text-muted-foreground tabular-nums">
                  <span>
                    {application.applicant.quizzesCompleted} quizzes ·{" "}
                    {application.applicant.totalXp.toLocaleString("en-US")} XP
                  </span>

                  {warnings > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-streak-soft px-2 py-0.5 font-semibold text-streak-ink">
                      <TriangleAlertIcon aria-hidden className="size-3" />
                      {warnings} to look at
                    </span>
                  )}

                  {!pending && (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 font-semibold",
                        row.status === "APPROVED"
                          ? "bg-correct-soft text-correct-ink"
                          : "bg-incorrect-soft text-incorrect-ink",
                      )}>
                      {row.status === "APPROVED" ? "Approved" : "Rejected"}
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
