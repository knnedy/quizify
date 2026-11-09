"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { SearchXIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  USERS_LIST_KEY,
  USERS_PAGE_SIZE,
  defaultDirection,
  toSearchString,
  type UserFilter,
  type UserQuery,
  type UserSort,
} from "@/lib/admin-users";
import {
  banUser,
  grantCreator,
  revokeCreator,
  unbanUser,
} from "@/server/actions/admin-users";
import type { ActionResult } from "@/types/actions";
import type { UserRow } from "@/types/admin-users";
import { ConfirmDialog } from "../../_components/confirm-dialog";
import { TablePagination } from "../../_components/table-pagination";
import { useKeyMap } from "../../_hooks/use-key-map";
import { useUserNavigation } from "../_hooks/use-user-navigation";
import { BanDialog, type BanInput } from "./ban-dialog";
import { UsersTable } from "./users-table";
import { UsersToolbar } from "./users-toolbar";

function firstName(name: string) {
  return name.split(" ")[0] ?? name;
}

export function UsersExplorer({
  rows,
  total,
  page,
  pageCount,
  counts,
  query,
  meId,
  canManageRoles,
}: {
  rows: UserRow[];
  total: number;
  page: number;
  pageCount: number;
  counts: Record<UserFilter, number>;
  query: UserQuery;
  meId: number;
  canManageRoles: boolean;
}) {
  const { navigate, pending } = useUserNavigation();
  const [acting, startAction] = useTransition();
  const [search, setSearch] = useState(query.q);
  const [banTarget, setBanTarget] = useState<UserRow | null>(null);
  const [banOpen, setBanOpen] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<UserRow | null>(null);
  const [revokeOpen, setRevokeOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const listSearch = toSearchString(query);

  // The profile page reads this, so its back link returns to the same view.
  useEffect(() => {
    try {
      window.sessionStorage.setItem(USERS_LIST_KEY, listSearch);
    } catch {
      // Storage can be unavailable, and the back link just goes to the list.
    }
  }, [listSearch]);

  useEffect(() => {
    const term = search.trim();
    if (term === query.q) return;

    const id = window.setTimeout(() => navigate({ q: term }, "replace"), 300);
    return () => window.clearTimeout(id);
  }, [search, query.q, navigate]);

  useKeyMap(!banOpen && !revokeOpen, {
    "/": () => searchRef.current?.focus(),
  });

  function changeSort(column: UserSort) {
    const dir =
      column === query.sort
        ? query.dir === "asc"
          ? "desc"
          : "asc"
        : defaultDirection(column);

    navigate({ sort: column, dir });
  }

  function changePage(next: number) {
    navigate({ page: next });
    topRef.current?.scrollIntoView({ block: "start" });
  }

  function reset() {
    setSearch("");
    navigate({ q: "", filter: "all" });
  }

  function run(task: () => Promise<ActionResult>, success: string) {
    startAction(async () => {
      const result = await task();

      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(success);
    });
  }

  function startBan(user: UserRow) {
    setBanTarget(user);
    setBanOpen(true);
  }

  function ban(input: BanInput) {
    if (!banTarget) return;
    const { id, name } = banTarget;

    startAction(async () => {
      const result = await banUser({ userId: id, ...input });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      setBanOpen(false);
      toast.success(
        result.hidden > 0
          ? `${firstName(name)} was banned and ${result.hidden} ${result.hidden === 1 ? "quiz was" : "quizzes were"} hidden`
          : `${firstName(name)} was banned`,
      );
    });
  }

  function unban(user: UserRow) {
    run(
      () => unbanUser({ userId: user.id }),
      `${firstName(user.name)} can sign in again`,
    );
  }

  function grant(user: UserRow) {
    run(
      () => grantCreator({ userId: user.id }),
      `${firstName(user.name)} is now a creator`,
    );
  }

  function startRevoke(user: UserRow) {
    setRevokeTarget(user);
    setRevokeOpen(true);
  }

  function revoke() {
    if (!revokeTarget) return;
    const { id, name } = revokeTarget;

    setRevokeOpen(false);
    run(
      () => revokeCreator({ userId: id }),
      `${firstName(name)} is no longer a creator`,
    );
  }

  return (
    <div
      ref={topRef}
      aria-busy={pending || acting}
      className="scroll-mt-6 space-y-5">
      <UsersToolbar
        filter={query.filter}
        counts={counts}
        search={search}
        inputRef={searchRef}
        onSearch={setSearch}
        onFilter={(filter) => navigate({ filter })}
      />

      {rows.length > 0 ? (
        <UsersTable
          rows={rows}
          meId={meId}
          canManageRoles={canManageRoles}
          sort={query.sort}
          dir={query.dir}
          busy={pending || acting}
          onSort={changeSort}
          actions={{
            onBan: startBan,
            onUnban: unban,
            onGrant: grant,
            onRevoke: startRevoke,
          }}
        />
      ) : (
        <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-2xl border border-dashed px-6 py-16 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <SearchXIcon aria-hidden className="size-7" />
          </span>
          <div className="space-y-1">
            <h2 className="text-xl">No users match</h2>
            <p className="text-sm text-muted-foreground">
              Try a different name or email, or switch to another filter.
            </p>
          </div>
          <Button variant="outline" onClick={reset}>
            Clear search and filters
          </Button>
        </div>
      )}

      {total > 0 && (
        <TablePagination
          page={page}
          pageCount={pageCount}
          total={total}
          pageSize={USERS_PAGE_SIZE}
          label="users"
          disabled={pending}
          onPage={changePage}
        />
      )}

      {banTarget && (
        <BanDialog
          open={banOpen}
          onOpenChange={setBanOpen}
          name={banTarget.name}
          publishedQuizzes={banTarget.published}
          pending={acting}
          onBan={ban}
        />
      )}

      {revokeTarget && (
        <ConfirmDialog
          open={revokeOpen}
          onOpenChange={setRevokeOpen}
          title={`Remove ${revokeTarget.name}'s creator role?`}
          description="They can't create new quizzes after this. Quizzes they already published stay up."
          confirmLabel="Remove role"
          destructive
          onConfirm={revoke}
        />
      )}
    </div>
  );
}
