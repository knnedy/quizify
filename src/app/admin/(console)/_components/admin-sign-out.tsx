"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOutIcon } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

// Ends the admin session only. The main site keeps its own.
export function AdminSignOut() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function signOut() {
    startTransition(async () => {
      const { error } = await authClient.signOut();

      if (error) {
        toast.error(error.message ?? "Unable to sign out. Please try again.");
        return;
      }

      router.replace("/sign-in");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      aria-label="Sign out"
      title="Sign out"
      disabled={isPending}
      onClick={signOut}
      className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-60">
      <LogOutIcon aria-hidden className="size-4" />
    </button>
  );
}
