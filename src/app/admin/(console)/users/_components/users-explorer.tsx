"use client";

import { useEffect, useRef, useState } from "react";
import { SearchXIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "../../_components/confirm-dialog";
import { TablePagination } from "../../_components/table-pagination";
import { useKeyMap } from "../../_hooks/use-key-map";
import { useUserNavigation } from "../_hooks/use-user-navigation";
import { applyToRow, type UserChange, type UserRow } from "../mock-data";
import {
  USERS_LIST_KEY,
  USERS_PAGE_SIZE,
  defaultDirection,
  toSearchString,
  type UserFilter,
  type UserQuery,
  type UserSort,
} from "../query-params";
import { BanDialog, type BanInput } from "./ban-dialog";
import { UsersTable } from "./users-table";
import { UsersToolbar } from "./users-toolbar";

function firstName(name: string) {
  return name.split(" ")[0];
}

export function UsersExplorer({
  rows,
  total,
  page,
  pageCount,
  counts,
  query,
  meId,
}: {
  rows: UserRow[];
  total: number;
  page: number;
  pageCount: number;
  counts: Record<UserFilter, number>;
  query: UserQuery;
  meId: number;
}) {
  const { navigate, pending } = useUserNavigation();
  const [search, setSearch] = useState(query.q);
  const [changes, setChanges] = useState<Record<number, UserChange[]>>({});
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

  const effective = rows.map((row) => applyToRow(row, changes[row.id]));

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

  function pushChange(id: number, change: UserChange) {
    setChanges((previous) => ({
      ...previous,
      [id]: [...(previous[id] ?? []), change],
    }));
  }

  function undo(id: number) {
    setChanges((previous) => ({
      ...previous,
      [id]: (previous[id] ?? []).slice(0, -1),
    }));
  }

  function startBan(user: UserRow) {
    setBanTarget(user);
    setBanOpen(true);
  }

  // Mock only: the real actions write to the database and refresh the page.
  function ban(input: BanInput) {
    if (!banTarget) return;

    const { id, name } = banTarget;
    setBanOpen(false);
    pushChange(id, { kind: "BAN", ...input });
    toast.success(`${firstName(name)} was banned`, {
      action: { label: "Undo", onClick: () => undo(id) },
    });
  }

  function unban(user: UserRow) {
    pushChange(user.id, { kind: "UNBAN" });
    toast.success(`${firstName(user.name)} can sign in again`, {
      action: { label: "Undo", onClick: () => undo(user.id) },
    });
  }

  function grant(user: UserRow) {
    pushChange(user.id, { kind: "GRANT" });
    toast.success(`${firstName(user.name)} is now a creator`, {
      action: { label: "Undo", onClick: () => undo(user.id) },
    });
  }

  function startRevoke(user: UserRow) {
    setRevokeTarget(user);
    setRevokeOpen(true);
  }

  function revoke() {
    if (!revokeTarget) return;

    const { id, name } = revokeTarget;
    setRevokeOpen(false);
    pushChange(id, { kind: "REVOKE" });
    toast.success(`${firstName(name)} is no longer a creator`, {
      action: { label: "Undo", onClick: () => undo(id) },
    });
  }

  return (
    <div ref={topRef} aria-busy={pending} className="scroll-mt-6 space-y-5">
      <UsersToolbar
        filter={query.filter}
        counts={counts}
        search={search}
        inputRef={searchRef}
        onSearch={setSearch}
        onFilter={(filter) => navigate({ filter })}
      />

      {effective.length > 0 ? (
        <UsersTable
          rows={effective}
          meId={meId}
          sort={query.sort}
          dir={query.dir}
          busy={pending}
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
