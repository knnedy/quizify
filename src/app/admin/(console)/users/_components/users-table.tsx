"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from "lucide-react";
import { formatDate } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import type { UserRow } from "../mock-data";
import type { SortDirection, UserSort } from "../query-params";
import { BanBadge, RoleBadge, activityLabel } from "./user-badges";
import { UserRowMenu, type RowActions } from "./user-row-menu";

const headClass = "bg-muted/90 backdrop-blur lg:sticky lg:top-0 lg:z-10";
const roleColumn = "hidden sm:table-cell";
const activeColumn = "hidden md:table-cell";
const wideColumn = "hidden xl:table-cell";

function SortHeader({
  column,
  label,
  sort,
  dir,
  align = "left",
  className,
  onSort,
}: {
  column: UserSort;
  label: string;
  sort: UserSort;
  dir: SortDirection;
  align?: "left" | "right";
  className?: string;
  onSort: (column: UserSort) => void;
}) {
  const active = sort === column;
  const Icon = !active
    ? ChevronsUpDownIcon
    : dir === "asc"
      ? ArrowUpIcon
      : ArrowDownIcon;

  return (
    <th
      scope="col"
      aria-sort={
        active ? (dir === "asc" ? "ascending" : "descending") : undefined
      }
      className={cn(
        headClass,
        "px-4 py-2.5 font-medium",
        align === "right" && "text-right",
        className,
      )}>
      <button
        type="button"
        onClick={() => onSort(column)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          active && "text-foreground",
        )}>
        {label}
        <Icon aria-hidden className={cn("size-3.5", !active && "opacity-50")} />
      </button>
    </th>
  );
}

export function UsersTable({
  rows,
  meId,
  sort,
  dir,
  busy,
  onSort,
  actions,
}: {
  rows: UserRow[];
  meId: number;
  sort: UserSort;
  dir: SortDirection;
  busy: boolean;
  onSort: (column: UserSort) => void;
  actions: RowActions;
}) {
  const router = useRouter();

  function open(event: MouseEvent<HTMLTableRowElement>, id: number) {
    // Real links and buttons inside the row keep their own behavior.
    if ((event.target as HTMLElement).closest("a, button")) return;
    router.push(`/admin/users/${id}`);
  }

  return (
    <div
      className={cn(
        "overflow-clip rounded-2xl border bg-card shadow-xs transition-opacity",
        busy && "opacity-60",
      )}>
      <table className="w-full border-collapse text-left text-sm">
        <thead className="text-xs text-muted-foreground">
          <tr>
            <SortHeader
              column="name"
              label="User"
              sort={sort}
              dir={dir}
              onSort={onSort}
            />
            <th
              scope="col"
              className={cn(headClass, roleColumn, "px-4 py-2.5 font-medium")}>
              Role
            </th>
            <SortHeader
              column="active"
              label="Last active"
              sort={sort}
              dir={dir}
              className={activeColumn}
              onSort={onSort}
            />
            <SortHeader
              column="quizzes"
              label="Played"
              sort={sort}
              dir={dir}
              align="right"
              className={wideColumn}
              onSort={onSort}
            />
            <SortHeader
              column="xp"
              label="XP"
              sort={sort}
              dir={dir}
              align="right"
              className={wideColumn}
              onSort={onSort}
            />
            <SortHeader
              column="joined"
              label="Joined"
              sort={sort}
              dir={dir}
              className={wideColumn}
              onSort={onSort}
            />
            <th scope="col" className={cn(headClass, "w-14 px-3 py-2.5")}>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>

        <tbody className="divide-y border-t">
          {rows.map((user) => {
            const banned = user.ban !== null;
            const isSelf = user.id === meId;
            const recent =
              user.lastActiveDays !== null && user.lastActiveDays <= 1;

            return (
              <tr
                key={user.id}
                onClick={(event) => open(event, user.id)}
                className="cursor-pointer transition-colors hover:bg-muted/40">
                <td className="px-4 py-3.5">
                  <div className="flex max-w-88 items-center gap-3.5">
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

                    <div className="min-w-0">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="block truncate rounded-sm font-medium hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                        {user.name}
                        {isSelf && (
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            you
                          </span>
                        )}
                      </Link>
                      <p className="truncate text-muted-foreground">
                        {user.email}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 sm:hidden">
                        {banned && <BanBadge />}
                        <RoleBadge role={user.role} />
                      </div>
                    </div>
                  </div>
                </td>

                <td className={cn(roleColumn, "px-4 py-3.5")}>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <RoleBadge role={user.role} />
                    {banned && <BanBadge />}
                  </div>
                </td>

                <td className={cn(activeColumn, "px-4 py-3.5")}>
                  <span className="inline-flex items-center gap-2 whitespace-nowrap text-muted-foreground tabular-nums">
                    {recent && (
                      <span
                        aria-hidden
                        className="size-2 rounded-full bg-correct"
                      />
                    )}
                    {activityLabel(user.lastActiveDays)}
                  </span>
                </td>

                <td
                  className={cn(
                    wideColumn,
                    "px-4 py-3.5 text-right tabular-nums",
                  )}>
                  {user.quizzesCompleted}
                </td>
                <td
                  className={cn(
                    wideColumn,
                    "px-4 py-3.5 text-right tabular-nums",
                  )}>
                  {user.totalXp.toLocaleString("en-US")}
                </td>
                <td
                  className={cn(
                    wideColumn,
                    "px-4 py-3.5 whitespace-nowrap text-muted-foreground",
                  )}>
                  {formatDate(user.joinedAt)}
                </td>

                <td
                  className="w-14 px-3 py-3.5 text-right"
                  onClick={(event) => event.stopPropagation()}>
                  <UserRowMenu user={user} isSelf={isSelf} actions={actions} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
