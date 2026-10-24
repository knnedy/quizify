import type { ReactNode } from "react";
import { ZapIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function XpChip({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-xp-soft px-3 py-1 text-sm font-semibold text-xp-ink tabular-nums",
        className,
      )}>
      <ZapIcon aria-hidden className="size-3.5 fill-current" />
      {children}
    </span>
  );
}
