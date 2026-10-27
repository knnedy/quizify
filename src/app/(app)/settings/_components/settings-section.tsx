import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SettingsSection({
  id,
  title,
  description,
  tone = "default",
  children,
}: {
  id: string;
  title: string;
  description: string;
  tone?: "default" | "danger";
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={cn(
        "scroll-mt-24 overflow-hidden rounded-2xl border bg-card shadow-xs",
        tone === "danger" && "border-incorrect/30",
      )}>
      <header className="space-y-1.5 px-6 pt-6 sm:px-7 sm:pt-7">
        <h2 id={`${id}-heading`} className="text-xl">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </header>
      {children}
    </section>
  );
}

export function SectionBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-6 p-6 sm:p-7", className)}>{children}</div>
  );
}

export function SectionFooter({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/30 px-6 py-4 sm:px-7">
      {children}
    </div>
  );
}
