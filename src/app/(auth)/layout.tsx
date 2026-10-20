import type { ReactNode } from "react";
import Link from "next/link";
import {
  BrainCircuitIcon,
  CheckIcon,
  FlameIcon,
  PenLineIcon,
  TrophyIcon,
} from "lucide-react";

const previewOptions = [
  { label: "Mars", correct: false },
  { label: "Jupiter", correct: false },
  { label: "Saturn", correct: true },
  { label: "Neptune", correct: false },
];

const highlights = [
  { icon: TrophyIcon, label: "Earn XP and achievements" },
  { icon: FlameIcon, label: "Build daily streaks" },
  { icon: PenLineIcon, label: "Create and share quizzes" },
];

function Brand({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 font-semibold">
      <span
        className={
          inverted
            ? "flex size-8 items-center justify-center rounded-lg bg-white text-zinc-950"
            : "flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
        }>
        <BrainCircuitIcon className="size-4" />
      </span>
      <span className="text-lg tracking-tight">Quizify</span>
    </Link>
  );
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-zinc-950 p-12 text-zinc-50 lg:flex">
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[48px_48px] mask-[radial-gradient(ellipse_at_center,black,transparent_75%)]"
        />
        <div
          aria-hidden
          className="absolute -top-32 -left-32 size-96 rounded-full bg-indigo-500/25 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -right-24 -bottom-24 size-96 rounded-full bg-violet-500/20 blur-3xl"
        />

        <div className="relative">
          <Brand inverted />
        </div>

        <div className="relative space-y-10">
          <div className="space-y-4">
            <h2 className="max-w-md text-4xl leading-tight font-semibold tracking-tight">
              Learn something new, one quiz at a time.
            </h2>
            <p className="max-w-md text-base text-zinc-400">
              Test your knowledge, climb the leaderboard and build your own
              quizzes for the world to play.
            </p>
          </div>

          <div aria-hidden className="relative max-w-sm">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-sm">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Question 3 of 10</span>
                <span className="flex items-center gap-1 text-amber-400">
                  <FlameIcon className="size-3.5" />5 day streak
                </span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[30%] rounded-full bg-indigo-400" />
              </div>
              <p className="mt-5 text-base font-medium">
                Which planet has the most moons?
              </p>
              <div className="mt-4 space-y-2">
                {previewOptions.map((option) => (
                  <div
                    key={option.label}
                    className={
                      option.correct
                        ? "flex items-center justify-between rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-3.5 py-2.5 text-sm text-emerald-300"
                        : "flex items-center justify-between rounded-lg border border-white/10 px-3.5 py-2.5 text-sm text-zinc-300"
                    }>
                    {option.label}
                    {option.correct && <CheckIcon className="size-4" />}
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -right-6 -bottom-5 rounded-xl bg-emerald-500 px-3.5 py-2 text-sm font-semibold text-white shadow-lg">
              +50 XP
            </div>
          </div>
        </div>

        <ul className="relative flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-400">
          {highlights.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2">
              <Icon className="size-4 text-zinc-300" />
              {label}
            </li>
          ))}
        </ul>
      </aside>

      <main className="flex flex-col px-6 py-8 sm:px-10">
        <div className="lg:hidden">
          <Brand />
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </main>
    </div>
  );
}
