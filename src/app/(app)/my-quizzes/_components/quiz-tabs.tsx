import Link from "next/link";
import { cn } from "@/lib/utils";
import type { MyQuizStatus } from "../mock-data";

export type StatusFilter =
  | "all"
  | "published"
  | "draft"
  | "archived"
  | "suspended";

const filters: {
  value: StatusFilter;
  label: string;
  status: MyQuizStatus | null;
}[] = [
  { value: "all", label: "All", status: null },
  { value: "published", label: "Published", status: "PUBLISHED" },
  { value: "draft", label: "Drafts", status: "DRAFT" },
  { value: "archived", label: "Archived", status: "ARCHIVED" },
  { value: "suspended", label: "Suspended", status: "SUSPENDED" },
];

export function parseStatusFilter(value: string | undefined): StatusFilter {
  return filters.find((filter) => filter.value === value)?.value ?? "all";
}

export function filterStatus(value: StatusFilter) {
  return filters.find((filter) => filter.value === value)?.status ?? null;
}

export function filterLabel(value: StatusFilter) {
  return filters.find((filter) => filter.value === value)?.label ?? "All";
}

export function QuizTabs({
  active,
  counts,
  total,
}: {
  active: StatusFilter;
  counts: Record<MyQuizStatus, number>;
  total: number;
}) {
  // Suspended only shows up when something is actually suspended.
  const visible = filters.filter(
    (filter) =>
      filter.status !== "SUSPENDED" ||
      counts.SUSPENDED > 0 ||
      active === filter.value,
  );

  return (
    <nav
      aria-label="Filter by status"
      className="inline-flex max-w-full flex-wrap gap-1 rounded-xl border bg-muted/50 p-1">
      {visible.map((filter) => {
        const isActive = active === filter.value;
        const count = filter.status ? counts[filter.status] : total;

        return (
          <Link
            key={filter.value}
            href={
              filter.value === "all"
                ? "/my-quizzes"
                : `/my-quizzes?status=${filter.value}`
            }
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              isActive
                ? "bg-primary text-primary-foreground shadow-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}>
            {filter.label}
            <span className="tabular-nums opacity-75">{count}</span>
          </Link>
        );
      })}
    </nav>
  );
}
