import type { ReactNode } from "react";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { XpChip } from "@/components/xp-chip";

export function DashboardHero({
  title,
  text,
  xp,
  canCreate,
  children,
}: {
  title: string;
  text: string;
  xp: number;
  canCreate: boolean;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_70%_at_90%_0%,var(--glow),transparent)]"
      />
      <div className="relative mx-auto max-w-6xl space-y-8 px-6 py-10 sm:py-14">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl">{title}</h1>
            <p className="max-w-prose text-base text-muted-foreground">
              {text}
            </p>
            {xp > 0 && (
              <div>
                <XpChip>{xp.toLocaleString("en-US")} XP</XpChip>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/quizzes"
              className={buttonVariants({ variant: "outline", size: "lg" })}>
              Browse quizzes
            </Link>
            {canCreate && (
              <Link
                href="/my-quizzes/new"
                className={buttonVariants({
                  size: "lg",
                  className: "shadow-primary",
                })}>
                <PlusIcon />
                New quiz
              </Link>
            )}
          </div>
        </div>

        {children}
      </div>
    </section>
  );
}
