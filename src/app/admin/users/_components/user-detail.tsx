import {
  ArrowLeftIcon,
  BadgeMinusIcon,
  BanIcon,
  ShieldCheckIcon,
  Undo2Icon,
} from "lucide-react";
import { Keycap } from "@/components/keycap";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format-date";
import type { AdminUser } from "../mock-data";
import { CreatorPanel } from "./creator-panel";
import { ModerationHistory } from "./moderation-history";
import { BanBadge, RoleBadge, activityLabel } from "./user-badges";
import { UserActivity } from "./user-activity";
import { UserStatsGrid } from "./user-stats";

export function UserDetail({
  user,
  isSelf,
  canUndo,
  onBan,
  onUnban,
  onRevoke,
  onUndo,
  onBack,
}: {
  user: AdminUser;
  isSelf: boolean;
  canUndo: boolean;
  onBan: () => void;
  onUnban: () => void;
  onRevoke: () => void;
  onUndo: () => void;
  onBack: () => void;
}) {
  const { ban } = user;
  const staff = user.role === "ADMIN" || user.role === "MODERATOR";
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
    <article
      aria-labelledby="user-heading"
      className="flex min-h-0 flex-1 animate-in flex-col overflow-hidden rounded-2xl border bg-card shadow-sm duration-200 fade-in">
      <div className="min-h-0 flex-1 space-y-7 overflow-y-auto overscroll-contain p-5 sm:p-7">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground lg:hidden">
          <ArrowLeftIcon aria-hidden className="size-4" />
          All users
        </button>

        <header className="flex flex-wrap items-center gap-4">
          <span
            aria-hidden
            className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary font-display text-2xl font-bold text-primary-foreground shadow-primary">
            {user.name.charAt(0).toUpperCase()}
          </span>

          <div className="min-w-0 flex-1 space-y-1">
            <h2 id="user-heading" className="truncate text-2xl">
              {user.name}
            </h2>
            <p className="truncate text-sm text-muted-foreground">
              {user.email}
            </p>
            <p className="text-sm text-muted-foreground">
              Joined {formatDate(user.joinedAt)} · {lastActive}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {ban && <BanBadge className="px-3 py-1 text-sm" />}
            <RoleBadge role={user.role} className="px-3 py-1 text-sm" />
          </div>
        </header>

        {ban && (
          <section
            aria-labelledby="ban-heading"
            className="space-y-2 rounded-xl border border-incorrect/30 bg-incorrect-soft px-4 py-3.5 text-incorrect-ink">
            <h3 id="ban-heading" className="flex items-center gap-2 text-base">
              <BanIcon aria-hidden className="size-4.5" />
              Banned{" "}
              {ban.bannedAt
                ? `on ${formatDate(ban.bannedAt)}`
                : "just now"} by {ban.bannedBy}
            </h3>
            <p className="text-sm">{ban.reason}</p>
            <p className="text-sm font-medium">
              {ban.expiresAt
                ? `Ends on ${formatDate(ban.expiresAt)}`
                : "Permanent"}
            </p>
          </section>
        )}

        <UserStatsGrid stats={user.stats} />
        <UserActivity weekly={user.stats.weekly} recent={user.recent} />

        {user.creator && (
          <CreatorPanel
            creator={user.creator}
            former={user.role !== "CREATOR"}
          />
        )}

        <ModerationHistory entries={user.history} />
      </div>

      <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t bg-muted/30 px-5 py-4 sm:px-7">
        <div className="flex min-h-9 items-center">
          {canUndo ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="-ml-2"
              onClick={onUndo}>
              <Undo2Icon />
              Undo last change
            </Button>
          ) : note ? (
            <p className="text-sm text-muted-foreground">{note}</p>
          ) : (
            <p className="hidden items-center gap-1.5 text-xs text-muted-foreground md:flex">
              <Keycap className="h-5 min-w-5 text-[11px]">J</Keycap>
              <Keycap className="h-5 min-w-5 text-[11px]">K</Keycap>
              browse
              <Keycap className="h-5 min-w-5 text-[11px]">
                {ban ? "U" : "B"}
              </Keycap>
              {ban ? "unban" : "ban"}
            </p>
          )}
        </div>

        {!note && (
          <div className="ml-auto flex items-center gap-3">
            {user.role === "CREATOR" && (
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={onRevoke}>
                <BadgeMinusIcon />
                Remove creator role
              </Button>
            )}
            {ban ? (
              <Button
                type="button"
                size="lg"
                className="shadow-primary"
                onClick={onUnban}>
                <ShieldCheckIcon />
                Unban
              </Button>
            ) : (
              <Button
                type="button"
                variant="destructive"
                size="lg"
                onClick={onBan}>
                <BanIcon />
                Ban user
              </Button>
            )}
          </div>
        )}
      </footer>
    </article>
  );
}
