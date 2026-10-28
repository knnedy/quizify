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

export function filterToStatus(value: ApplicationFilter): ApplicationStatus {
  return filters.find((filter) => filter.value === value)?.status ?? "PENDING";
}

export function ApplicationTabs({
  active,
  counts,
  onChange,
}: {
  active: ApplicationFilter;
  counts: Record<ApplicationStatus, number>;
  onChange: (value: ApplicationFilter) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Filter by status"
      className="inline-flex max-w-full flex-wrap gap-1 rounded-xl border bg-muted/50 p-1">
      {filters.map((filter) => {
        const isActive = active === filter.value;

        return (
          <button
            key={filter.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(filter.value)}
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
          </button>
        );
      })}
    </div>
  );
}
