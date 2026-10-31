"use client";

import { useState, useTransition } from "react";
import { BookmarkIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { setBookmark } from "@/server/actions/bookmarks";

export function BookmarkToggle({
  slug,
  initial,
  title,
}: {
  slug: string;
  initial: boolean;
  title: string;
}) {
  const [saved, setSaved] = useState(initial);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = !saved;
    setSaved(next);

    startTransition(async () => {
      const result = await setBookmark({ slug, saved: next });
      if (!result.ok) {
        setSaved(!next);
        toast.error(result.error);
      }
    });
  }

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${title} from saved` : `Save ${title}`}
      disabled={isPending}
      onClick={toggle}
      className={cn(
        "relative z-10 inline-flex size-8 items-center justify-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-60",
        saved
          ? "text-primary"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}>
      <BookmarkIcon className={cn("size-4.5", saved && "fill-current")} />
    </button>
  );
}
