import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SwitchRow({
  label,
  description,
  checked,
  onCheckedChange,
  children,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  children?: ReactNode;
}) {
  const labelId = useId();

  return (
    <div className="rounded-xl border bg-card px-4 py-3.5 shadow-xs">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-0.5">
          <p id={labelId} className="font-medium">
            {label}
          </p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-labelledby={labelId}
          onClick={() => onCheckedChange(!checked)}
          className={cn(
            "mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            checked ? "border-primary bg-primary" : "border-input bg-muted",
          )}>
          <span
            aria-hidden
            className={cn(
              "size-4.5 rounded-full bg-white shadow-xs transition-transform",
              checked ? "translate-x-5.5" : "translate-x-0.5",
            )}
          />
        </button>
      </div>

      {children}
    </div>
  );
}
