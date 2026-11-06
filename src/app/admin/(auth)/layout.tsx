import type { ReactNode } from "react";
import { ShieldCheckIcon } from "lucide-react";
import { ThemeToggle } from "@/components/shell/theme-toggle";

export default function AdminAuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-svh flex-col px-6 py-5 sm:px-10">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-primary">
            <ShieldCheckIcon aria-hidden className="size-5" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-lg font-bold tracking-tight">
              Quizify
            </span>
            <span className="block text-xs text-muted-foreground">
              Admin console
            </span>
          </span>
        </span>
        <ThemeToggle />
      </div>

      <div className="flex flex-1 items-center justify-center py-10">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </main>
  );
}
