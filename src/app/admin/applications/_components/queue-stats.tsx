import { cn } from "@/lib/utils";

function Tile({
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
    <div className="rounded-2xl border bg-card p-5 shadow-xs">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "mt-3 font-display text-3xl leading-none font-bold tabular-nums",
          warn && "text-streak-ink",
        )}>
        {value}
      </dd>
      <dd className="mt-2 text-sm text-muted-foreground tabular-nums">
        {note}
      </dd>
    </div>
  );
}

export function QueueStats({
  waiting,
  longestWait,
  approved,
  rejected,
}: {
  waiting: number;
  longestWait: number | null;
  approved: number;
  rejected: number;
}) {
  const decided = approved + rejected;
  const rate = decided > 0 ? Math.round((approved / decided) * 100) : null;

  const wait =
    longestWait === null
      ? "None"
      : longestWait === 0
        ? "Today"
        : `${longestWait} ${longestWait === 1 ? "day" : "days"}`;

  return (
    <dl className="grid gap-3 sm:grid-cols-3">
      <Tile
        label="Waiting for review"
        value={String(waiting)}
        note={waiting === 0 ? "The queue is clear" : "Oldest first"}
      />
      <Tile
        label="Longest wait"
        value={wait}
        note="Oldest application in the queue"
        warn={longestWait !== null && longestWait >= 5}
      />
      <Tile
        label="Approval rate"
        value={rate === null ? "None yet" : `${rate}%`}
        note={`${approved} approved, ${rejected} rejected`}
      />
    </dl>
  );
}
