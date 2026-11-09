"use client";

import { useState, useTransition } from "react";
import { BanIcon, InboxIcon } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/format-date";
import type { ProfileTab } from "@/lib/schemas/admin-profile";
import {
  addUserNote,
  banUser,
  grantCreator,
  revokeCreator,
  signOutEverywhere,
  unbanUser,
} from "@/server/actions/admin-users";
import type { ActionResult } from "@/types/actions";
import type { AdminUser } from "@/types/admin-users";
import { ConfirmDialog } from "../../_components/confirm-dialog";
import { AccountCard } from "./account-card";
import { AdminNotes } from "./admin-notes";
import { BanDialog, type BanInput } from "./ban-dialog";
import { CreatorPanel } from "./creator-panel";
import { ModerationHistory } from "./moderation-history";
import { ProfileTabs } from "./profile-tabs";
import { UserActivity } from "./user-activity";
import { UserHeader } from "./user-header";
import { UserStatsGrid } from "./user-stats";

function firstName(name: string) {
  return name.split(" ")[0] ?? name;
}

export function UserProfile({
  user,
  meId,
  canManageRoles,
  initialTab,
}: {
  user: AdminUser;
  meId: number;
  canManageRoles: boolean;
  initialTab: ProfileTab;
}) {
  const [tab, setTab] = useState<ProfileTab>(initialTab);
  const [banOpen, setBanOpen] = useState(false);
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const hasQuizzes = user.creator !== null;
  const activeTab: ProfileTab =
    tab === "quizzes" && !hasQuizzes ? "overview" : tab;
  const name = firstName(user.name);

  const tabs: { value: ProfileTab; label: string; count?: number }[] = [
    { value: "overview", label: "Overview" },
    ...(hasQuizzes
      ? [
          {
            value: "quizzes" as const,
            label: "Quizzes",
            count: user.creator?.quizzes.length ?? 0,
          },
        ]
      : []),
    { value: "history", label: "History", count: user.history.length },
  ];

  function changeTab(next: ProfileTab) {
    setTab(next);

    const url = new URL(window.location.href);
    if (next === "overview") url.searchParams.delete("tab");
    else url.searchParams.set("tab", next);
    window.history.replaceState(null, "", url);
  }

  function run(task: () => Promise<ActionResult>, success: string) {
    startTransition(async () => {
      const result = await task();

      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(success);
    });
  }

  function ban(input: BanInput) {
    startTransition(async () => {
      const result = await banUser({ userId: user.id, ...input });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      setBanOpen(false);
      toast.success(
        result.hidden > 0
          ? `${name} was banned and ${result.hidden} ${result.hidden === 1 ? "quiz was" : "quizzes were"} hidden`
          : `${name} was banned`,
      );
    });
  }

  function unban() {
    run(() => unbanUser({ userId: user.id }), `${name} can sign in again`);
  }

  function grant() {
    run(() => grantCreator({ userId: user.id }), `${name} is now a creator`);
  }

  function revoke() {
    setRevokeOpen(false);
    run(
      () => revokeCreator({ userId: user.id }),
      `${name} is no longer a creator`,
    );
  }

  function signOut() {
    setSignOutOpen(false);

    startTransition(async () => {
      const result = await signOutEverywhere({ userId: user.id });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success(
        result.ended === 0
          ? `${name} had no active sessions`
          : `${name} was signed out of ${result.ended} ${result.ended === 1 ? "session" : "sessions"}`,
      );
    });
  }

  async function addNote(text: string) {
    const result = await addUserNote({ userId: user.id, body: text });

    if (!result.ok) {
      toast.error(result.error);
      return false;
    }

    toast.success("Note added");
    return true;
  }

  return (
    <div className="space-y-6">
      <UserHeader
        user={user}
        isSelf={user.id === meId}
        canManageRoles={canManageRoles}
        busy={isPending}
        actions={{
          onBan: () => setBanOpen(true),
          onUnban: unban,
          onGrant: grant,
          onRevoke: () => setRevokeOpen(true),
          onSignOut: () => setSignOutOpen(true),
        }}
      />

      {user.ban && (
        <section
          aria-labelledby="ban-heading"
          className="space-y-2 rounded-2xl border border-incorrect/30 bg-incorrect-soft px-5 py-4 text-incorrect-ink">
          <h2 id="ban-heading" className="flex items-center gap-2 text-base">
            <BanIcon aria-hidden className="size-4.5" />
            Banned
            {user.ban.bannedAt ? ` on ${formatDate(user.ban.bannedAt)}` : ""}
            {user.ban.bannedBy ? ` by ${user.ban.bannedBy}` : ""}
          </h2>
          <p className="text-sm">
            {user.ban.reason || "No reason was recorded."}
          </p>
          <p className="text-sm font-medium">
            {user.ban.expiresAt
              ? `Ends on ${formatDate(user.ban.expiresAt)}`
              : "Permanent"}
          </p>
        </section>
      )}

      <ProfileTabs active={activeTab} tabs={tabs} onChange={changeTab} />

      {activeTab === "overview" && (
        <div className="grid animate-in gap-6 duration-200 fade-in lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start">
          <div className="space-y-6">
            <UserStatsGrid stats={user.stats} />
            <div className="rounded-2xl border bg-card p-5 shadow-xs sm:p-6">
              <UserActivity weekly={user.stats.weekly} recent={user.recent} />
            </div>
          </div>

          <div className="space-y-6">
            <AccountCard user={user} />
            <AdminNotes notes={user.notes} onAdd={addNote} />
          </div>
        </div>
      )}

      {activeTab === "quizzes" && (
        <div className="animate-in rounded-2xl border bg-card p-5 shadow-xs duration-200 fade-in sm:p-6">
          {user.creator && user.creator.quizzes.length > 0 ? (
            <CreatorPanel
              creator={user.creator}
              former={user.role !== "CREATOR"}
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
          <ModerationHistory entries={user.history} />
        </div>
      )}

      <BanDialog
        open={banOpen}
        onOpenChange={setBanOpen}
        name={user.name}
        publishedQuizzes={user.published}
        pending={isPending}
        onBan={ban}
      />
      <ConfirmDialog
        open={revokeOpen}
        onOpenChange={setRevokeOpen}
        title={`Remove ${user.name}'s creator role?`}
        description="They can't create new quizzes after this. Quizzes they already published stay up."
        confirmLabel="Remove role"
        destructive
        onConfirm={revoke}
      />
      <ConfirmDialog
        open={signOutOpen}
        onOpenChange={setSignOutOpen}
        title={`Sign ${user.name} out everywhere?`}
        description="They are signed out of all their active sessions and need to sign in again."
        confirmLabel="Sign out"
        onConfirm={signOut}
      />
    </div>
  );
}
