import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import type { AdminCreator } from "@/types/admin-quizzes";

export function CreatorCard({ creator }: { creator: AdminCreator | null }) {
  if (!creator) {
    return (
      <section
        aria-label="Creator"
        className="flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-xs">
        <span
          aria-hidden
          className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary font-display text-lg font-bold text-secondary-foreground">
          F
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium">Former member</p>
          <p className="text-sm text-muted-foreground">
            The creator&rsquo;s account was deleted.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label="Creator"
      className="flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-xs">
      <span
        aria-hidden
        className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary font-display text-lg font-bold text-secondary-foreground">
        {creator.name.charAt(0).toUpperCase()}
      </span>

      <div className="min-w-0 flex-1">
        <Link
          href={`/users/${creator.id}`}
          className="block truncate font-medium hover:underline">
          {creator.name}
        </Link>
        <p className="text-sm text-muted-foreground tabular-nums">
          {creator.former ? "Former creator" : "Creator"} · {creator.published}{" "}
          published
          {creator.strikes > 0 &&
            ` · ${creator.strikes} earlier ${creator.strikes === 1 ? "action" : "actions"}`}
        </p>
      </div>

      <Link
        href={`/users/${creator.id}`}
        className={buttonVariants({ variant: "ghost", size: "sm" })}>
        Profile
      </Link>
    </section>
  );
}
