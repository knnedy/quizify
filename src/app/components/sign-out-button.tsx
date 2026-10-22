"use client";

import { useRouter } from "next/navigation";
import { LogOutIcon } from "lucide-react";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export function SignOutButton() {
  const router = useRouter();

  async function onClick() {
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
    <button
      type="button"
      aria-label="Sign out"
      onClick={onClick}
      className={cn(
        buttonVariants({ variant: "ghost", size: "sm" }),
        "max-sm:size-9 max-sm:px-0",
      )}>
      <LogOutIcon className="size-4" />
      <span className="hidden sm:inline">Sign out</span>
    </button>
  );
}
