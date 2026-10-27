import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ApplicationStatus } from "../mock-data";

export type ApplicationFilter = "pending" | "approved" | "rejected";

const filters: {
  value: ApplicationFilter;
  label: string;
  status: ApplicationStatus;
}[] = [
  { value: "pending", label: "Pending", status: "PENDING" },
  { value: "approved", label: "Approved", status: "APPROVED" },
  { value: "rejected", label: "Rejected", status: "REJECTED" },
];

export function parseFilter(value: string | undefined): ApplicationFilter {
  return filters.find((filter) => filter.value === value)?.value ?? "pending";
}

export function filterToStatus(value: ApplicationFilter) {
  return filters.find((filter) => filter.value === value)?.status ?? "PENDING";
}

export function applicationsHref(filter: ApplicationFilter, id?: number) {
  const params = new URLSearchParams();
  if (filter !== "pending") params.set("status", filter);
  if (id !== undefined) params.set("id", String(id));

  const query = params.toString();
  return query ? `/admin/applications?${query}` : "/admin/applications";
}

export function ApplicationTabs({
  active,
  counts,
}: {
  active: ApplicationFilter;
  counts: Record<ApplicationStatus, number>;
}) {
  return (
    <nav
      aria-label="Filter by status"
      className="inline-flex max-w-full flex-wrap gap-1 rounded-xl border bg-muted/50 p-1">
      {filters.map((filter) => {
        const isActive = active === filter.value;

        return (
          <Link
            key={filter.value}
            href={applicationsHref(filter.value)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              isActive
                ? "bg-primary text-primary-foreground shadow-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}>
            {filter.label}
            <span className="tabular-nums opacity-75">
              {counts[filter.status]}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
