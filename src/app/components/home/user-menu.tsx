"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ListChecksIcon, LogOutIcon, SettingsIcon } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const itemClass =
  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring";

export function UserMenu({ name, email }: { name: string; email: string }) {
  const router = useRouter();
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

  async function signOut() {
    setOpen(false);
    const { error } = await authClient.signOut();

    if (error) {
      toast.error(error.message ?? "Unable to sign out. Please try again.");
      return;
    }

    toast.success("Signed out");
    router.push("/");
    router.refresh();
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Account menu"
        aria-expanded={open}
        aria-controls="user-menu-panel"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex size-9 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary ring-offset-background transition-all hover:ring-2 hover:ring-primary/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          open && "ring-2 ring-primary/30",
        )}>
        {name.charAt(0).toUpperCase()}
      </button>

      {open && (
        <div
          id="user-menu-panel"
          className="absolute top-full right-0 z-50 mt-2 w-64 origin-top-right animate-in rounded-xl border bg-popover p-1.5 text-popover-foreground shadow-md duration-150 fade-in zoom-in-95">
          <div className="px-2.5 py-2">
            <p className="truncate text-sm font-semibold">{name}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </div>

          <div className="my-1 h-px bg-border" />

          <Link
            href="/my-quizzes"
            onClick={() => setOpen(false)}
            className={itemClass}>
            <ListChecksIcon className="size-4 text-muted-foreground" />
            My quizzes
          </Link>
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className={itemClass}>
            <SettingsIcon className="size-4 text-muted-foreground" />
            Settings
          </Link>

          <div className="my-1 h-px bg-border" />

          <button type="button" onClick={signOut} className={itemClass}>
            <LogOutIcon className="size-4 text-muted-foreground" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
