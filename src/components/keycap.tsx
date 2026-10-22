import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Keycap({ className, ...props }: ComponentProps<"kbd">) {
  return (
    <kbd
      {...props}
      className={cn(
        "inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-b-2 border-border bg-card px-1.5 font-sans text-xs leading-none font-semibold text-muted-foreground",
        className,
      )}
    />
  );
}
