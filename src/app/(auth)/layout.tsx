import type { ReactNode } from "react";
import { Brand } from "../../components/shell/brand";
import { ThemeToggle } from "../../components/shell/theme-toggle";
import { AuthPreview } from "./_components/auth-preview";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r bg-muted/40 p-12 lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_0%_0%,var(--glow),transparent)]"
        />

        <Brand className="relative self-start" />

        <div className="relative space-y-10">
          <div className="space-y-4">
            <h2 className="max-w-md text-4xl leading-[1.1]">
              Your next streak starts with one question.
            </h2>
            <p className="max-w-md text-base text-muted-foreground">
              Play quick quizzes, earn XP for every round and see how you rank
              against other players.
            </p>
          </div>
          <AuthPreview />
        </div>

        <p className="relative text-sm text-muted-foreground">
          Free to join. You can browse quizzes without an account.
        </p>
      </aside>

      <main className="flex flex-col px-6 py-5 sm:px-10">
        <div className="flex items-center justify-between lg:justify-end">
          <Brand className="lg:hidden" />
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </main>
    </div>
  );
}
