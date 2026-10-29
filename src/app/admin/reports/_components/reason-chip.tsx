import type { ReportReason } from "@/lib/report-reasons";
import { cn } from "@/lib/utils";
import type { ReportedQuiz } from "../mock-data";

const shortLabels: Record<ReportReason, string> = {
  NSFW: "Graphic",
  HATE: "Hate",
  SPAM: "Spam",
  MISLEADING: "Misleading",
  COPYRIGHT: "Copyright",
  OTHER: "Other",
};

const serious: readonly ReportReason[] = ["NSFW", "HATE"];

export function isSerious(reason: ReportReason) {
  return serious.includes(reason);
}

export function reasonCounts(item: ReportedQuiz) {
  const counts = new Map<ReportReason, number>();

  for (const report of item.reports) {
    counts.set(report.reason, (counts.get(report.reason) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count);
}

export function ReasonChip({
  reason,
  className,
}: {
  reason: ReportReason;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
        isSerious(reason)
          ? "bg-incorrect-soft text-incorrect-ink"
          : "bg-muted text-muted-foreground",
        className,
      )}>
      {shortLabels[reason]}
    </span>
  );
}
