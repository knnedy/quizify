import { cn } from "@/lib/utils";
import type { AdminUser } from "../mock-data";
import { BanBadge, RoleBadge, activityLabel } from "./user-badges";

export function UserList({
  users,
  activeId,
  onSelect,
}: {
  users: AdminUser[];
  activeId: number;
  onSelect: (id: number) => void;
}) {
  return (
    <ul className="divide-y overflow-hidden rounded-2xl border bg-card shadow-xs">
      {users.map((user) => {
        const active = user.id === activeId;
        const banned = user.ban !== null;

        return (
          <li key={user.id}>
            <button
              type="button"
              aria-current={active ? "true" : undefined}
              onClick={() => onSelect(user.id)}
              className={cn(
                "relative flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
                active
                  ? "lg:bg-primary-soft lg:before:absolute lg:before:inset-y-3 lg:before:left-0 lg:before:w-0.75 lg:before:rounded-r-full lg:before:bg-primary"
                  : "hover:bg-muted/50",
              )}>
              <span
                aria-hidden
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-xl font-display text-lg font-bold",
                  banned
                    ? "bg-incorrect-soft text-incorrect-ink"
                    : "bg-secondary text-secondary-foreground",
                )}>
                {user.name.charAt(0).toUpperCase()}
              </span>

              <span className="min-w-0 flex-1 space-y-1">
                <span className="flex items-center justify-between gap-3">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                    {activityLabel(user.lastActiveDays)}
                  </span>
                </span>

                <span className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm text-muted-foreground">
                    {user.email}
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5">
                    {banned && <BanBadge />}
                    {user.role !== "USER" && <RoleBadge role={user.role} />}
                  </span>
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
