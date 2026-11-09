import type { ReactNode } from "react";
import { formatDate } from "@/lib/format-date";
import type { AdminUser } from "@/types/admin-users";
import { activityLabel } from "./user-badges";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm font-medium">{children}</dd>
    </div>
  );
}

export function AccountCard({ user }: { user: AdminUser }) {
  const { account } = user;

  return (
    <section
      aria-labelledby="account-heading"
      className="rounded-2xl border bg-card p-5 shadow-xs">
      <h3 id="account-heading" className="text-base">
        Account
      </h3>

      <dl className="mt-2 divide-y">
        <Row label="Last played">{activityLabel(user.lastActiveDays)}</Row>
        <Row label="Active sessions">{account.sessions}</Row>
        <Row label="Timezone">{account.timezone}</Row>
        <Row label="Member since">{formatDate(user.joinedAt)}</Row>
      </dl>
    </section>
  );
}
