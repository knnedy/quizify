import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { DraftQuiz } from "../mock-data";

export function DraftsCard({ drafts }: { drafts: DraftQuiz[] }) {
  return (
    <section
      aria-labelledby="drafts-heading"
      className="rounded-2xl border bg-card p-5 shadow-xs sm:p-6">
      <div className="space-y-1">
        <h2 id="drafts-heading" className="text-xl">
          Drafts to finish
        </h2>
        <p className="text-sm text-muted-foreground">
          Nobody can play these until you publish them.
        </p>
      </div>

      {drafts.length === 0 ? (
        <p className="mt-5 rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
          No drafts. Everything you started is published.
        </p>
      ) : (
        <ul className="mt-3 divide-y">
          {drafts.map((draft) => (
            <li key={draft.slug} className="flex items-center gap-3 py-3.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{draft.title}</p>
                <p className="flex items-center gap-1.5 text-xs text-streak-ink">
                  <span
                    aria-hidden
                    className="size-1.5 shrink-0 rounded-full bg-streak"
                  />
                  {draft.note}
                </p>
              </div>
              <Link
                href={`/my-quizzes/${draft.slug}/edit`}
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                })}>
                Continue
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/my-quizzes/new"
        className={buttonVariants({
          variant: "outline",
          className: "mt-4 w-full",
        })}>
        <PlusIcon />
        Start a new quiz
      </Link>
    </section>
  );
}
