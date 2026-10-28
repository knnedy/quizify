"use client";

import { useRouter } from "next/navigation";
import {
  BadgeCheckIcon,
  BadgeMinusIcon,
  BanIcon,
  CopyIcon,
  EllipsisIcon,
  ShieldCheckIcon,
  UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UserRow } from "../mock-data";

export type RowActions = {
  onBan: (user: UserRow) => void;
  onUnban: (user: UserRow) => void;
  onGrant: (user: UserRow) => void;
  onRevoke: (user: UserRow) => void;
};

export function UserRowMenu({
  user,
  isSelf,
  actions,
}: {
  user: UserRow;
  isSelf: boolean;
  actions: RowActions;
}) {
  const router = useRouter();
  const staff = user.role === "ADMIN" || user.role === "MODERATOR";
  const canModerate = !isSelf && !staff;

  function copyEmail() {
    navigator.clipboard.writeText(user.email).then(
      () => toast.success("Email copied"),
      () => toast.error("Couldn't copy the email"),
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Actions for ${user.name}`}
        className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-popup-open:bg-accent data-popup-open:text-foreground">
        <EllipsisIcon aria-hidden className="size-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem
          onClick={() => router.push(`/admin/users/${user.id}`)}>
          <UserIcon />
          View profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyEmail}>
          <CopyIcon />
          Copy email
        </DropdownMenuItem>

        {canModerate && (
          <>
            <DropdownMenuSeparator />

            {user.role === "USER" && (
              <DropdownMenuItem onClick={() => actions.onGrant(user)}>
                <BadgeCheckIcon />
                Make creator
              </DropdownMenuItem>
            )}
            {user.role === "CREATOR" && (
              <DropdownMenuItem onClick={() => actions.onRevoke(user)}>
                <BadgeMinusIcon />
                Remove creator role
              </DropdownMenuItem>
            )}

            {user.ban ? (
              <DropdownMenuItem onClick={() => actions.onUnban(user)}>
                <ShieldCheckIcon />
                Unban
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                variant="destructive"
                onClick={() => actions.onBan(user)}>
                <BanIcon />
                Ban user
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
