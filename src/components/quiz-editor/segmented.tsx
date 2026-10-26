import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Segmented<T extends string | number | null>({
  label,
  value,
  options,
  onChange,
  className,
}: {
  label: string;
  value: T;
  options: { value: T; label: ReactNode }[];
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "inline-flex max-w-full flex-wrap gap-1 rounded-xl border bg-muted/50 p-1",
        className,
      )}>
      {options.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={String(option.value)}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-lg px-3.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              active
                ? "bg-primary text-primary-foreground shadow-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}>
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
