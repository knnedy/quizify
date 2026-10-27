import type { Metadata } from "next";
import { XpChip } from "@/components/xp-chip";
import { formatDate } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import { requireUser } from "@/server/session";
import { DeleteAccountSection } from "./_components/delete-account";
import { PreferencesSection } from "./_components/preferences-section";
import { ProfileSection } from "./_components/profile-section";
import { SecuritySection } from "./_components/security-section";
import { SettingsNav } from "./_components/settings-nav";
import { getSettingsUser, type SettingsRole } from "./mock-data";

export const metadata: Metadata = { title: "Settings" };

const roleLabels: Record<SettingsRole, string> = {
  USER: "Player",
  CREATOR: "Creator",
  MODERATOR: "Moderator",
  ADMIN: "Admin",
};

export default async function SettingsPage() {
  await requireUser("/settings");
  const user = await getSettingsUser();

  return (
    <main>
      <section className="relative overflow-hidden border-b">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_70%_at_90%_0%,var(--glow),transparent)]"
        />
        <div className="relative mx-auto max-w-6xl space-y-8 px-6 py-10 sm:py-14">
          <h1 className="text-4xl sm:text-5xl">Settings</h1>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-4">
            <span
              aria-hidden
              className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary font-display text-2xl font-bold text-primary-foreground shadow-primary">
              {user.name.charAt(0).toUpperCase()}
            </span>

            <div className="min-w-0 space-y-1">
              <p className="truncate font-display text-xl font-semibold">
                {user.name}
              </p>
              <p className="truncate text-muted-foreground">{user.email}</p>
            </div>

            <ul className="flex flex-wrap items-center gap-2 sm:ml-auto">
              <li
                className={cn(
                  "rounded-full px-3 py-1 text-sm font-semibold",
                  user.role === "USER"
                    ? "bg-muted text-muted-foreground"
                    : "bg-primary-soft text-primary",
                )}>
                {roleLabels[user.role]}
              </li>
              <li className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
                Member since {formatDate(user.joinedAt)}
              </li>
              <li>
                <XpChip>{user.totalXp.toLocaleString("en-US")} XP</XpChip>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-12">
        <SettingsNav />

        <div className="max-w-3xl space-y-6">
          <ProfileSection
            email={user.email}
            initial={{
              name: user.name,
              website: user.links.website,
              github: user.links.github,
              x: user.links.x,
            }}
          />
          <PreferencesSection initialTimezone={user.timezone} />
          <SecuritySection />
          <DeleteAccountSection />
        </div>
      </div>
    </main>
  );
}
