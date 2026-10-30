"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftIcon,
  FlagIcon,
  LayoutDashboardIcon,
  ShieldCheckIcon,
  UserCheckIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminCounts, AdminIdentity } from "../mock-data";
import { AdminThemeSwitch } from "./admin-theme-switch";

type NavItem = {
  href: string;
  label: string;
  short: string;
  Icon: LucideIcon;
  count?: keyof AdminCounts;
  exact?: boolean;
};

const items: NavItem[] = [
  {
    href: "/admin",
    label: "Overview",
    short: "Overview",
    Icon: LayoutDashboardIcon,
    exact: true,
  },
  {
    href: "/admin/users",
    label: "Users",
    short: "Users",
    Icon: UsersIcon,
  },
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
    count: "reports",
  },
];

const roleLabels: Record<AdminIdentity["role"], string> = {
  ADMIN: "Admin",
  MODERATOR: "Moderator",
};

function Brand() {
  return (
    <Link
      href="/admin"
      aria-label="Quizify admin overview"
      className="flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
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
    </Link>
  );
}

export function AdminNav({
  counts,
  admin,
}: {
  counts: AdminCounts;
  admin: AdminIdentity;
}) {
  const pathname = usePathname();

  function isActive(item: NavItem) {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
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
            {items.map((item) => {
              const { href, short, Icon, count } = item;
              const active = isActive(item);
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

      <aside className="hidden flex-col gap-5 overflow-y-auto border-r bg-card/40 p-4 lg:flex">
        <div className="px-2 pt-2">
          <Brand />
        </div>

        <nav aria-label="Admin sections" className="flex-1">
          <ul className="space-y-1">
            {items.map((item) => {
              const { href, label, Icon, count } = item;
              const active = isActive(item);
              const value = count ? counts[count] : 0;

              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                      active
                        ? "bg-primary-soft font-semibold text-primary before:absolute before:inset-y-2.5 before:left-0 before:w-0.75 before:rounded-full before:bg-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}>
                    <Icon aria-hidden className="size-4.5 shrink-0" />
                    <span className="truncate">{label}</span>
                    {value > 0 && (
                      <span className="ml-auto min-w-5 rounded-full bg-primary px-1.5 text-center text-xs leading-5 font-semibold text-primary-foreground tabular-nums">
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

        <div className="space-y-3">
          <AdminThemeSwitch />

          <Link
            href="/"
            className="flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring">
            <ArrowLeftIcon aria-hidden className="size-4.5 shrink-0" />
            Back to Quizify
          </Link>

          <div className="flex items-center gap-3 rounded-xl border bg-card p-2.5 shadow-xs">
            <span
              aria-hidden
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary font-display text-base font-bold text-primary-foreground">
              {admin.name.charAt(0).toUpperCase()}
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-sm font-medium">
                {admin.name}
              </span>
              <span className="block text-xs text-muted-foreground">
                {roleLabels[admin.role]}
              </span>
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
