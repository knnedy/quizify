"use client";

import { useRef, useState } from "react";
import { SearchIcon, SearchXIcon } from "lucide-react";
import { toast } from "sonner";
import { Keycap } from "@/components/keycap";
import { inputClass } from "@/components/quiz-editor/form-block";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "../../_components/confirm-dialog";
import { FilterTabs } from "../../_components/filter-tabs";
import { SplitPane } from "../../_components/split-pane";
import { useKeyMap } from "../../_hooks/use-key-map";
import {
  applyUserChanges,
  type AdminUser,
  type UserChange,
} from "../mock-data";
import { BanDialog, type BanInput } from "./ban-dialog";
import { UserDetail } from "./user-detail";
import { UserList } from "./user-list";

type Tab = "all" | "players" | "creators" | "staff" | "banned";

const tabs: {
  value: Tab;
  label: string;
  test: (user: AdminUser) => boolean;
}[] = [
  { value: "all", label: "All", test: () => true },
  { value: "players", label: "Players", test: (user) => user.role === "USER" },
  {
    value: "creators",
    label: "Creators",
    test: (user) => user.role === "CREATOR",
  },
  {
    value: "staff",
    label: "Staff",
    test: (user) => user.role === "MODERATOR" || user.role === "ADMIN",
  },
  { value: "banned", label: "Banned", test: (user) => user.ban !== null },
];

function firstName(name: string) {
  return name.split(" ")[0];
}

export function UsersWorkspace({
  users,
  meId,
}: {
  users: AdminUser[];
  meId: number;
}) {
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [changes, setChanges] = useState<Record<number, UserChange[]>>({});
  const [banning, setBanning] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const effective = users.map((user) =>
    applyUserChanges(user, changes[user.id]),
  );

  const term = query.trim().toLowerCase();
  const activeTab = tabs.find((item) => item.value === tab) ?? tabs[0];
  const list = effective.filter(
    (user) =>
      activeTab.test(user) &&
      (!term ||
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)),
  );
  const selected =
    list.find((user) => user.id === selectedId) ?? list[0] ?? null;

  const tabOptions = tabs.map((item) => ({
    value: item.value,
    label: item.label,
    count: effective.filter(item.test).length,
  }));

  function canModerate(user: AdminUser) {
    return (
      user.id !== meId && (user.role === "USER" || user.role === "CREATOR")
    );
  }

  // On a phone the list and the detail take turns, so the keys only act on
  // what is actually on screen.
  function detailVisible() {
    return mobileOpen || window.matchMedia("(min-width: 1024px)").matches;
  }

  function select(id: number) {
    setSelectedId(id);
    setMobileOpen(true);
  }

  function changeTab(next: Tab) {
    setTab(next);
    setSelectedId(null);
    setMobileOpen(false);
  }

  function changeQuery(value: string) {
    setQuery(value);
    setSelectedId(null);
    setMobileOpen(false);
  }

  function step(direction: 1 | -1) {
    if (list.length === 0) return;

    const index = selected
      ? list.findIndex((user) => user.id === selected.id)
      : 0;
    const next =
      list[Math.min(Math.max(index + direction, 0), list.length - 1)];
    setSelectedId(next.id);
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

  function startBan() {
    if (selected && canModerate(selected) && !selected.ban && detailVisible()) {
      setBanning(true);
    }
  }

  // Mock only: the real actions write to the database and refresh the page.
  function ban(input: BanInput) {
    if (!selected) return;

    const { id, name } = selected;
    setBanning(false);
    pushChange(id, { kind: "BAN", ...input });
    toast.success(`${firstName(name)} was banned`, {
      action: { label: "Undo", onClick: () => undo(id) },
    });
  }

  function unban() {
    if (!selected || !selected.ban || !canModerate(selected)) return;
    if (!detailVisible()) return;

    const { id, name } = selected;
    pushChange(id, { kind: "UNBAN" });
    toast.success(`${firstName(name)} can sign in again`, {
      action: { label: "Undo", onClick: () => undo(id) },
    });
  }

  function revoke() {
    if (!selected) return;

    const { id, name } = selected;
    setRevoking(false);
    pushChange(id, { kind: "REVOKE" });
    toast.success(`${firstName(name)} is no longer a creator`, {
      action: { label: "Undo", onClick: () => undo(id) },
    });
  }

  useKeyMap(!banning && !revoking, {
    j: () => step(1),
    k: () => step(-1),
    b: startBan,
    u: unban,
    "/": () => searchRef.current?.focus(),
  });

  return (
    <div className="flex flex-col gap-5 lg:min-h-0 lg:flex-1">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <FilterTabs
          label="Filter users"
          value={tab}
          options={tabOptions}
          onChange={changeTab}
        />

        <div className="relative w-full sm:w-72">
          <SearchIcon
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            ref={searchRef}
            type="text"
            inputMode="search"
            value={query}
            placeholder="Search name or email"
            aria-label="Search users"
            autoComplete="off"
            onChange={(event) => changeQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") event.currentTarget.blur();
            }}
            className={cn(inputClass, "py-2 pr-10 pl-10 text-sm")}
          />
          <Keycap className="pointer-events-none absolute top-1/2 right-3 h-5 min-w-5 -translate-y-1/2 text-[11px]">
            /
          </Keycap>
        </div>
      </div>

      {selected ? (
        <SplitPane
          showDetail={mobileOpen}
          list={
            <UserList users={list} activeId={selected.id} onSelect={select} />
          }
          detail={
            <UserDetail
              key={selected.id}
              user={selected}
              isSelf={selected.id === meId}
              canUndo={(changes[selected.id]?.length ?? 0) > 0}
              onBan={() => setBanning(true)}
              onUnban={unban}
              onRevoke={() => setRevoking(true)}
              onUndo={() => undo(selected.id)}
              onBack={() => setMobileOpen(false)}
            />
          }
        />
      ) : (
        <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-2xl border border-dashed px-6 py-16 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <SearchXIcon aria-hidden className="size-7" />
          </span>
          <div className="space-y-1">
            <h2 className="text-xl">No users match</h2>
            <p className="text-sm text-muted-foreground">
              Try a different name, or switch to another filter.
            </p>
          </div>
        </div>
      )}

      {selected && (
        <>
          <BanDialog
            open={banning}
            onOpenChange={setBanning}
            name={selected.name}
            publishedQuizzes={selected.creator?.published ?? 0}
            onBan={ban}
          />
          <ConfirmDialog
            open={revoking}
            onOpenChange={setRevoking}
            title={`Remove ${selected.name}'s creator role?`}
            description="They can't create new quizzes after this. Quizzes they already published stay up."
            confirmLabel="Remove role"
            destructive
            onConfirm={revoke}
          />
        </>
      )}
    </div>
  );
}
