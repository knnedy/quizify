import Link from "next/link";
import { formatDate } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import type { Application } from "../mock-data";
import { applicationsHref, type ApplicationFilter } from "./application-tabs";

function ago(days: number) {
  if (days === 0) return "today";
  return days === 1 ? "1 day ago" : `${days} days ago`;
}

function summary(application: Application) {
  if (application.status === "PENDING") {
    return `Applied ${ago(application.waitingDays)}`;
  }

  const verdict = application.status === "APPROVED" ? "Approved" : "Rejected";
  return application.decision
    ? `${verdict} ${formatDate(application.decision.reviewedAt)}`
    : verdict;
}

export function ApplicationList({
  items,
  activeId,
  filter,
}: {
  items: Application[];
  activeId: number | null;
  filter: ApplicationFilter;
}) {
  return (
    <ul className="divide-y overflow-hidden rounded-2xl border bg-card shadow-xs">
      {items.map((item) => {
        const active = item.id === activeId;
        const overdue = item.status === "PENDING" && item.waitingDays >= 5;

        return (
          <li key={item.id}>
            <Link
              href={applicationsHref(filter, item.id)}
              aria-current={active ? "true" : undefined}
              className={cn(
                "flex gap-3.5 px-4 py-4 transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
                active ? "lg:bg-primary-soft" : "hover:bg-muted/50",
              )}>
              <span
                aria-hidden
                className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary font-display text-base font-bold text-secondary-foreground">
                {item.applicant.name.charAt(0).toUpperCase()}
              </span>

              <span className="min-w-0 flex-1 space-y-1">
                <span className="flex items-center justify-between gap-3">
                  <span className="truncate font-medium">
                    {item.applicant.name}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 text-xs tabular-nums",
                      overdue
                        ? "font-semibold text-streak-ink"
                        : "text-muted-foreground",
                    )}>
                    {summary(item)}
                  </span>
                </span>

                <span className="line-clamp-2 text-sm text-muted-foreground">
                  {item.motivation}
                </span>

                {item.attempt > 1 && (
                  <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    Reapplied
                  </span>
                )}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
