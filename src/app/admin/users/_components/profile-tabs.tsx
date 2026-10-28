import { cn } from "@/lib/utils";

export type ProfileTab = "overview" | "quizzes" | "history";

export function ProfileTabs({
  active,
  tabs,
  onChange,
}: {
  active: ProfileTab;
  tabs: { value: ProfileTab; label: string; count?: number }[];
  onChange: (value: ProfileTab) => void;
}) {
  return (
    <nav aria-label="Profile sections" className="border-b">
      <ul className="-mb-px flex gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = tab.value === active;

          return (
            <li key={tab.value}>
              <button
                type="button"
                aria-current={isActive ? "true" : undefined}
                onClick={() => onChange(tab.value)}
                className={cn(
                  "inline-flex h-11 items-center gap-2 border-b-2 px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
                  isActive
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}>
                {tab.label}
                {tab.count !== undefined && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums">
                    {tab.count}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
