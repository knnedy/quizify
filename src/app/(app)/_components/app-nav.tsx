"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function AppNav({
  links,
}: {
  links: { href: string; label: string }[];
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
      {links.map((link) => {
        const active =
          pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring",
              active
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
