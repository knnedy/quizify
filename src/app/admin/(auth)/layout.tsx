import type { ReactNode } from "react";
import { ShieldCheckIcon } from "lucide-react";
import { Keycap } from "@/components/keycap";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { cn } from "@/lib/utils";

const shortcuts = [
  { keys: ["J", "K"], label: "Move between items in a queue" },
  { keys: ["A", "R"], label: "Approve or reject an application" },
  { keys: ["D", "S"], label: "Dismiss or suspend a reported quiz" },
  { keys: ["/"], label: "Search users" },
];

function AdminMark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-3", className)}>
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
  );
}

export default function AdminAuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r bg-muted/40 p-12 lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_0%_0%,var(--glow),transparent)]"
        />

        <AdminMark className="relative self-start" />

        <div className="relative space-y-10">
          <div className="space-y-4">
            <h2 className="max-w-md text-4xl leading-[1.1]">
              Keep Quizify a good place to play.
            </h2>
            <p className="max-w-md text-base text-muted-foreground">
              Review reports, decide on creator applications and look after the
              people who play.
            </p>
          </div>

          <ul
            aria-label="Keyboard shortcuts"
            className="max-w-md space-y-1 rounded-2xl border bg-card p-2.5 shadow-sm">
            {shortcuts.map((shortcut) => (
              <li
                key={shortcut.label}
                className="flex items-center gap-4 rounded-xl px-3 py-2.5">
                <span className="flex w-16 shrink-0 items-center gap-1.5">
                  {shortcut.keys.map((key) => (
                    <Keycap key={key}>{key}</Keycap>
                  ))}
                </span>
                <span className="text-sm text-muted-foreground">
                  {shortcut.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-muted-foreground">
          Everything you do here is recorded in the moderation history.
        </p>
      </aside>

      <main className="flex flex-col px-6 py-5 sm:px-10">
        <div className="flex items-center justify-between lg:justify-end">
          <AdminMark className="lg:hidden" />
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </main>
    </div>
  );
}
