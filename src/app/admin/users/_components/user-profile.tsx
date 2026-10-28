"use client";

import { useState } from "react";
import { BanIcon, InboxIcon } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/format-date";
import { ConfirmDialog } from "../../_components/confirm-dialog";
import {
  applyToDetail,
  type AdminNote,
  type AdminUser,
  type UserChange,
} from "../mock-data";
import { AccountCard } from "./account-card";
import { AdminNotes } from "./admin-notes";
import { BanDialog, type BanInput } from "./ban-dialog";
import { CreatorPanel } from "./creator-panel";
import { ModerationHistory } from "./moderation-history";
import { ProfileTabs, type ProfileTab } from "./profile-tabs";
import { UserActivity } from "./user-activity";
import { UserHeader } from "./user-header";
import { UserStatsGrid } from "./user-stats";

function firstName(name: string) {
  return name.split(" ")[0];
}

export function UserProfile({
  user,
  meId,
  initialTab,
}: {
  user: AdminUser;
  meId: number;
  initialTab: ProfileTab;
}) {
  const [changes, setChanges] = useState<UserChange[]>([]);
  const [extraNotes, setExtraNotes] = useState<AdminNote[]>([]);
  const [tab, setTab] = useState<ProfileTab>(initialTab);
  const [banOpen, setBanOpen] = useState(false);
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);

  const view = applyToDetail(user, changes);
  const notes = [...extraNotes, ...view.notes];
  const hasQuizzes = view.creator !== null || view.role === "CREATOR";
  const activeTab: ProfileTab =
    tab === "quizzes" && !hasQuizzes ? "overview" : tab;
  const name = firstName(view.name);

  const tabs: { value: ProfileTab; label: string; count?: number }[] = [
    { value: "overview", label: "Overview" },
    ...(hasQuizzes
      ? [
          {
            value: "quizzes" as const,
            label: "Quizzes",
            count: view.creator?.quizzes.length ?? 0,
          },
        ]
      : []),
    { value: "history", label: "History", count: view.history.length },
  ];

  function changeTab(next: ProfileTab) {
    setTab(next);

    const url = new URL(window.location.href);
    if (next === "overview") url.searchParams.delete("tab");
    else url.searchParams.set("tab", next);
    window.history.replaceState(null, "", url);
  }

  function push(change: UserChange) {
    setChanges((previous) => [...previous, change]);
  }

  function undo() {
    setChanges((previous) => previous.slice(0, -1));
  }

  // Mock only: the real actions write to the database and refresh the page.
  function ban(input: BanInput) {
    setBanOpen(false);
    push({ kind: "BAN", ...input });
    toast.success(`${name} was banned`, {
      action: { label: "Undo", onClick: undo },
    });
  }

  function unban() {
    push({ kind: "UNBAN" });
    toast.success(`${name} can sign in again`, {
      action: { label: "Undo", onClick: undo },
    });
  }

  function grant() {
    push({ kind: "GRANT" });
    toast.success(`${name} is now a creator`, {
      action: { label: "Undo", onClick: undo },
    });
  }

  function revoke() {
    setRevokeOpen(false);
    push({ kind: "REVOKE" });
    toast.success(`${name} is no longer a creator`, {
      action: { label: "Undo", onClick: undo },
    });
  }

  function signOut() {
    setSignOutOpen(false);
    toast.success(
      `${name} was signed out of ${view.account.sessions} ${view.account.sessions === 1 ? "session" : "sessions"}`,
    );
  }

  function addNote(text: string) {
    setExtraNotes((previous) => [
      { id: -(previous.length + 1), by: "you", at: null, text },
      ...previous,
    ]);
    toast.success("Note added");
  }

  return (
    <div className="space-y-6">
      <UserHeader
        user={view}
        isSelf={view.id === meId}
        canUndo={changes.length > 0}
        actions={{
          onBan: () => setBanOpen(true),
          onUnban: unban,
          onGrant: grant,
          onRevoke: () => setRevokeOpen(true),
          onSignOut: () => setSignOutOpen(true),
          onUndo: undo,
        }}
      />

      {view.ban && (
        <section
          aria-labelledby="ban-heading"
          className="space-y-2 rounded-2xl border border-incorrect/30 bg-incorrect-soft px-5 py-4 text-incorrect-ink">
          <h2 id="ban-heading" className="flex items-center gap-2 text-base">
            <BanIcon aria-hidden className="size-4.5" />
            Banned{" "}
            {view.ban.bannedAt
              ? `on ${formatDate(view.ban.bannedAt)}`
              : "just now"}{" "}
            by {view.ban.bannedBy}
          </h2>
          <p className="text-sm">{view.ban.reason}</p>
          <p className="text-sm font-medium">
            {view.ban.expiresAt
              ? `Ends on ${formatDate(view.ban.expiresAt)}`
              : "Permanent"}
          </p>
        </section>
      )}

      <ProfileTabs active={activeTab} tabs={tabs} onChange={changeTab} />

      {activeTab === "overview" && (
        <div className="grid animate-in gap-6 duration-200 fade-in lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start">
          <div className="space-y-6">
            <UserStatsGrid stats={view.stats} />
            <div className="rounded-2xl border bg-card p-5 shadow-xs sm:p-6">
              <UserActivity weekly={view.stats.weekly} recent={view.recent} />
            </div>
          </div>

          <div className="space-y-6">
            <AccountCard user={view} />
            <AdminNotes notes={notes} onAdd={addNote} />
          </div>
        </div>
      )}

      {activeTab === "quizzes" && (
        <div className="animate-in rounded-2xl border bg-card p-5 shadow-xs duration-200 fade-in sm:p-6">
          {view.creator && view.creator.quizzes.length > 0 ? (
            <CreatorPanel
              creator={view.creator}
              former={view.role !== "CREATOR"}
            />
          ) : (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <InboxIcon aria-hidden className="size-6" />
              </span>
              <p className="font-medium">No quizzes yet</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                {name} just became a creator. Their quizzes will show up here as
                they publish them.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "history" && (
        <div className="animate-in rounded-2xl border bg-card p-5 shadow-xs duration-200 fade-in sm:p-6">
          <ModerationHistory entries={view.history} />
        </div>
      )}

      <BanDialog
        open={banOpen}
        onOpenChange={setBanOpen}
        name={view.name}
        publishedQuizzes={view.published}
        onBan={ban}
      />
      <ConfirmDialog
        open={revokeOpen}
        onOpenChange={setRevokeOpen}
        title={`Remove ${view.name}'s creator role?`}
        description="They can't create new quizzes after this. Quizzes they already published stay up."
        confirmLabel="Remove role"
        destructive
        onConfirm={revoke}
      />
      <ConfirmDialog
        open={signOutOpen}
        onOpenChange={setSignOutOpen}
        title={`Sign ${view.name} out everywhere?`}
        description={`They are signed out of all ${view.account.sessions} active ${view.account.sessions === 1 ? "session" : "sessions"} and need to sign in again.`}
        confirmLabel="Sign out"
        onConfirm={signOut}
      />
    </div>
  );
}
