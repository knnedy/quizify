import { cn } from "@/lib/utils";

function Stat({
  label,
  value,
  hint,
  warn = false,
}: {
  label: string;
  value: string;
  hint?: string;
  warn?: boolean;
}) {
  return (
    <div title={hint} className="min-w-0 px-5 py-3">
      <dt className="truncate text-xs text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "mt-1.5 font-display text-2xl leading-none font-bold tabular-nums",
          warn && "text-streak-ink",
        )}>
        {value}
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
    <dl className="grid w-full grid-cols-3 divide-x rounded-2xl border bg-card shadow-xs sm:w-auto sm:min-w-[28rem]">
      <Stat label="Waiting" value={String(waiting)} />
      <Stat
        label="Longest wait"
        value={wait}
        warn={longestWait !== null && longestWait >= 5}
      />
      <Stat
        label="Approval rate"
        value={rate === null ? "None yet" : `${rate}%`}
        hint={`${approved} approved, ${rejected} rejected`}
      />
    </dl>
  );
}
