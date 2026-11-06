import {
  BadgeCheckIcon,
  BadgeMinusIcon,
  BanIcon,
  CopyIcon,
  EllipsisIcon,
  LogOutIcon,
  ShieldCheckIcon,
  Undo2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import type { AdminUser } from "../mock-data";
import { BanBadge, RoleBadge, activityLabel } from "./user-badges";

export type HeaderActions = {
  onBan: () => void;
  onUnban: () => void;
  onGrant: () => void;
  onRevoke: () => void;
  onSignOut: () => void;
  onUndo: () => void;
};

function copy(text: string, done: string) {
  navigator.clipboard.writeText(text).then(
    () => toast.success(done),
    () => toast.error("Couldn't copy"),
  );
}

export function UserHeader({
  user,
  isSelf,
  canUndo,
  actions,
}: {
  user: AdminUser;
  isSelf: boolean;
  canUndo: boolean;
  actions: HeaderActions;
}) {
  const banned = user.ban !== null;
  const staff = user.role === "ADMIN" || user.role === "MODERATOR";
  const canModerate = !isSelf && !staff;
  const note = isSelf
    ? "This is your account."
    : staff
      ? "Staff accounts can't be banned from here."
      : null;

  const lastActive =
    user.lastActiveDays === null
      ? "Hasn't played yet"
      : `Last active ${activityLabel(user.lastActiveDays).toLowerCase()}`;

  return (
    <header className="space-y-5 rounded-2xl border bg-card p-5 shadow-sm sm:p-7">
      <div className="flex flex-wrap items-start gap-x-6 gap-y-5">
        <span
          aria-hidden
          className={cn(
            "flex size-20 shrink-0 items-center justify-center rounded-3xl font-display text-4xl font-bold",
            banned
              ? "bg-incorrect-soft text-incorrect-ink"
              : "bg-primary text-primary-foreground shadow-primary",
          )}>
          {user.name.charAt(0).toUpperCase()}
        </span>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="truncate text-3xl">{user.name}</h1>
            <div className="flex items-center gap-2">
              <RoleBadge role={user.role} className="px-3 py-1 text-sm" />
              {banned && <BanBadge className="px-3 py-1 text-sm" />}
            </div>
          </div>
          <p className="truncate text-muted-foreground">{user.email}</p>
          <p className="text-sm text-muted-foreground">
            Joined {formatDate(user.joinedAt)} · {lastActive} · ID {user.id}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {canUndo && (
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={actions.onUndo}>
              <Undo2Icon />
              Undo last change
            </Button>
          )}

          {canModerate && user.role === "CREATOR" && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={actions.onRevoke}>
              <BadgeMinusIcon />
              Remove creator role
            </Button>
          )}
          {canModerate && user.role === "USER" && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={actions.onGrant}>
              <BadgeCheckIcon />
              Make creator
            </Button>
          )}
          {canModerate &&
            (banned ? (
              <Button
                type="button"
                size="lg"
                className="shadow-primary"
                onClick={actions.onUnban}>
                <ShieldCheckIcon />
                Unban
              </Button>
            ) : (
              <Button
                type="button"
                variant="destructive"
                size="lg"
                onClick={actions.onBan}>
                <BanIcon />
                Ban user
              </Button>
            ))}

          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="More actions"
              className="inline-flex size-9 items-center justify-center rounded-lg border bg-card text-muted-foreground shadow-xs transition-colors hover:border-foreground/25 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-popup-open:border-foreground/25 data-popup-open:text-foreground">
              <EllipsisIcon aria-hidden className="size-4" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onClick={() => copy(user.email, "Email copied")}>
                <CopyIcon />
                Copy email
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => copy(String(user.id), "User ID copied")}>
                <CopyIcon />
                Copy user ID
              </DropdownMenuItem>

              {canModerate && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={actions.onSignOut}>
                    <LogOutIcon />
                    Sign out everywhere
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {note && (
        <p className="border-t pt-4 text-sm text-muted-foreground">{note}</p>
      )}
    </header>
  );
}
