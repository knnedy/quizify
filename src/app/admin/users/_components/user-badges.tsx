import { BanIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "../mock-data";

export const roleLabels: Record<UserRole, string> = {
  USER: "Player",
  CREATOR: "Creator",
  MODERATOR: "Moderator",
  ADMIN: "Admin",
};

const roleTone: Record<UserRole, string> = {
  USER: "bg-muted text-muted-foreground",
  CREATOR: "bg-primary-soft text-primary",
  MODERATOR: "bg-xp-soft text-xp-ink",
  ADMIN: "bg-xp-soft text-xp-ink",
};

export function RoleBadge({
  role,
  className,
}: {
  role: UserRole;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
        roleTone[role],
        className,
      )}>
      {roleLabels[role]}
    </span>
  );
}

export function BanBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-incorrect-soft px-2 py-0.5 text-xs font-semibold text-incorrect-ink",
        className,
      )}>
      <BanIcon aria-hidden className="size-3" />
      Banned
    </span>
  );
}

export function activityLabel(days: number | null) {
  if (days === null) return "Never";
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;

  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}
