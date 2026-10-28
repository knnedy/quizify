"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftIcon,
  FlagIcon,
  ShieldCheckIcon,
  UserCheckIcon,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminCounts } from "../mock-data";

type NavItem = {
  href: string;
  label: string;
  short: string;
  Icon: LucideIcon;
  count?: keyof AdminCounts;
};

const items: NavItem[] = [
  {
    href: "/admin/applications",
    label: "Creator applications",
    short: "Applications",
    Icon: UserCheckIcon,
    count: "applications",
  },
  {
    href: "/admin/reports",
    label: "Reports",
    short: "Reports",
    Icon: FlagIcon,
  },
];

function Brand() {
  return (
    <span className="flex items-center gap-3">
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-primary">
        <ShieldCheckIcon aria-hidden className="size-5" />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-lg font-bold tracking-tight">
          Quizify
        </span>
        <span className="block text-xs text-muted-foreground">Admin</span>
      </span>
    </span>
  );
}

export function AdminNav({ counts }: { counts: AdminCounts }) {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3 px-6 pt-3">
          <Brand />
          <Link
            href="/"
            aria-label="Back to Quizify"
            className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring">
            <ArrowLeftIcon aria-hidden className="size-4" />
          </Link>
        </div>

        <nav
          aria-label="Admin sections"
          className="overflow-x-auto px-6 pt-3 pb-3">
          <ul className="flex w-max gap-2">
            {items.map(({ href, short, Icon, count }) => {
              const active = isActive(href);
              const value = count ? counts[count] : 0;

              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "inline-flex h-9 items-center gap-2 rounded-xl border px-3.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                      active
                        ? "border-primary bg-primary text-primary-foreground shadow-primary"
                        : "bg-card text-muted-foreground hover:border-foreground/25 hover:text-foreground",
                    )}>
                    <Icon aria-hidden className="size-4" />
                    {short}
                    {value > 0 && (
                      <span
                        className={cn(
                          "rounded-full px-1.5 text-xs font-semibold tabular-nums",
                          active
                            ? "bg-primary-foreground/20"
                            : "bg-primary-soft text-primary",
                        )}>
                        {value}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      <aside className="sticky top-0 hidden h-dvh flex-col border-r bg-card/40 lg:flex">
        <div className="px-6 pt-6 pb-6">
          <Brand />
        </div>

        <nav aria-label="Admin sections" className="flex-1 px-3">
          <ul className="space-y-1">
            {items.map(({ href, label, Icon, count }) => {
              const active = isActive(href);
              const value = count ? counts[count] : 0;

              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                      active
                        ? "bg-primary-soft text-foreground before:absolute before:inset-y-2 before:-left-3 before:w-1 before:rounded-r-full before:bg-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}>
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                        active
                          ? "bg-primary text-primary-foreground shadow-primary"
                          : "bg-muted",
                      )}>
                      <Icon aria-hidden className="size-4" />
                    </span>
                    {label}
                    {value > 0 && (
                      <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground tabular-nums">
                        {value}
                        <span className="sr-only"> waiting</span>
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t p-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring">
            <span className="flex size-8 items-center justify-center rounded-lg bg-muted">
              <ArrowLeftIcon aria-hidden className="size-4" />
            </span>
            Back to Quizify
          </Link>
        </div>
      </aside>
    </>
  );
}