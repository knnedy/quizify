import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AdminPage({
  title,
  description,
  fill = true,
  children,
}: {
  title: string;
  description: string;
  fill?: boolean;
  children: ReactNode;
}) {
  return (
    <main
      className={cn(
        "flex flex-col gap-6 px-6 py-6 sm:py-8",
        fill
          ? "lg:h-full lg:min-h-0 lg:gap-5 lg:py-7"
          : "mx-auto w-full max-w-7xl lg:py-9",
      )}>
      <header className="space-y-1">
        <h1 className="text-3xl">{title}</h1>
        <p className="max-w-prose text-sm text-muted-foreground">
          {description}
        </p>
      </header>
      {children}
    </main>
  );
}
