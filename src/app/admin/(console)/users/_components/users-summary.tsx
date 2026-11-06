import { cn } from "@/lib/utils";
import type { UserSummary } from "../mock-data";

function Cell({
  label,
  value,
  note,
  warn = false,
}: {
  label: string;
  value: string;
  note: string;
  warn?: boolean;
}) {
  return (
    <div className="bg-card px-5 py-4">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "mt-2 font-display text-3xl leading-none font-bold tabular-nums",
          warn && "text-incorrect-ink",
        )}>
        {value}
      </dd>
      <dd className="mt-1.5 text-xs text-muted-foreground">{note}</dd>
    </div>
  );
}

export function UsersSummary({ summary }: { summary: UserSummary }) {
  const activeShare =
    summary.total > 0
      ? Math.round((summary.activeThisWeek / summary.total) * 100)
      : 0;

  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border shadow-xs sm:grid-cols-4">
      <Cell
        label="Total users"
        value={summary.total.toLocaleString("en-US")}
        note="Everyone with an account"
      />
      <Cell
        label="New this week"
        value={summary.newThisWeek.toLocaleString("en-US")}
        note="Joined in the last 7 days"
      />
      <Cell
        label="Active this week"
        value={summary.activeThisWeek.toLocaleString("en-US")}
        note={`${activeShare}% of all users played`}
      />
      <Cell
        label="Banned"
        value={summary.banned.toLocaleString("en-US")}
        note="Cannot sign in right now"
        warn={summary.banned > 0}
      />
    </dl>
  );
}
