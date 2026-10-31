"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MenuIcon, XIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MobileMenu({
  links,
  isSignedIn,
}: {
  links: { href: string; label: string }[];
  isSignedIn: boolean;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div ref={containerRef} className="lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-menu-panel"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
        {open ? <XIcon className="size-5" /> : <MenuIcon className="size-5" />}
      </button>

      {open && (
        <div
          id="mobile-menu-panel"
          className="absolute inset-x-0 top-full animate-in border-b bg-background shadow-md duration-150 fade-in slide-in-from-top-1">
          <nav
            aria-label="Mobile"
            className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={close}
                className="rounded-lg px-3 py-2.5 text-base font-medium transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mx-auto flex max-w-6xl flex-col gap-2 border-t px-4 py-4 sm:hidden">
            {isSignedIn ? (
              <Link
                href="/dashboard"
                onClick={close}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full shadow-primary",
                )}>
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-up"
                  onClick={close}
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "w-full shadow-primary",
                  )}>
                  Get started
                </Link>
                <Link
                  href="/sign-in"
                  onClick={close}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "w-full",
                  )}>
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
