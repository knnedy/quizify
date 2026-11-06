import type { ReactNode } from "react";
import { CheckIcon, TriangleAlertIcon } from "lucide-react";
import { formatDate } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import type { AdminUser } from "../mock-data";
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
        <Row label="Email">
          <span
            className={cn(
              "inline-flex items-center gap-1.5",
              account.emailVerified ? "text-correct-ink" : "text-streak-ink",
            )}>
            {account.emailVerified ? (
              <CheckIcon aria-hidden className="size-4 stroke-3" />
            ) : (
              <TriangleAlertIcon aria-hidden className="size-4" />
            )}
            {account.emailVerified ? "Verified" : "Not verified"}
          </span>
        </Row>
        <Row label="Last sign-in">{activityLabel(account.lastSignInDays)}</Row>
        <Row label="Active sessions">{account.sessions}</Row>
        <Row label="Timezone">{account.timezone}</Row>
        <Row label="Member since">{formatDate(user.joinedAt)}</Row>
      </dl>
    </section>
  );
}
