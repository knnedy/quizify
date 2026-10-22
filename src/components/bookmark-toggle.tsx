"use client";

import { useState } from "react";
import { BookmarkIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function BookmarkToggle({
  initial,
  title,
}: {
  initial: boolean;
  title: string;
}) {
  const [saved, setSaved] = useState(initial);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${title} from saved` : `Save ${title}`}
      onClick={() => setSaved((value) => !value)}
      className={cn(
        "relative z-10 inline-flex size-8 items-center justify-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-ring",
        saved
          ? "text-primary"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}>
      <BookmarkIcon className={cn("size-[18px]", saved && "fill-current")} />
    </button>
  );
}
