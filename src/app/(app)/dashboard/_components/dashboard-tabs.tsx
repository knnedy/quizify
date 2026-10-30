import Link from "next/link";
import { cn } from "@/lib/utils";
import type { DashboardView } from "../mock-data";

const tabs: { value: DashboardView; label: string }[] = [
  { value: "playing", label: "Playing" },
  { value: "creating", label: "Creating" },
];

export function DashboardTabs({
  active,
  hrefs,
  attention,
}: {
  active: DashboardView;
  hrefs: Record<DashboardView, string>;
  attention: boolean;
}) {
  return (
    <nav
      aria-label="Dashboard view"
      className="inline-flex gap-1 rounded-xl border bg-card/70 p-1 shadow-xs backdrop-blur">
      {tabs.map((tab) => {
        const isActive = tab.value === active;
        const nudge = tab.value === "creating" && attention && !isActive;

        return (
          <Link
            key={tab.value}
            href={hrefs[tab.value]}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              isActive
                ? "bg-primary text-primary-foreground shadow-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}>
            {tab.label}
            {nudge && (
              <>
                <span aria-hidden className="size-2 rounded-full bg-streak" />
                <span className="sr-only">, needs attention</span>
              </>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
