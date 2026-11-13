import { isSerious } from "@/lib/admin-reports";
import type { ReportReason } from "@/lib/report-reasons";
import { cn } from "@/lib/utils";

const shortLabels: Record<ReportReason, string> = {
  NSFW: "Graphic",
  HATE: "Hate",
  SPAM: "Spam",
  MISLEADING: "Misleading",
  COPYRIGHT: "Copyright",
  OTHER: "Other",
};

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
