import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

export function EditorHeader({
  mode,
  title,
  statusBadge,
  dirty,
  children,
}: {
  mode: "new" | "edit";
  title: string;
  statusBadge?: ReactNode;
  dirty: boolean;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_70%_at_90%_0%,var(--glow),transparent)]"
      />
      <div className="relative mx-auto max-w-6xl space-y-5 px-6 py-8 sm:py-10">
        <Link
          href="/my-quizzes"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeftIcon className="size-4" />
          My quizzes
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl sm:text-4xl">
                {mode === "new" ? "New quiz" : "Edit quiz"}
              </h1>
              {statusBadge}
            </div>
            <p className="truncate text-muted-foreground">
              {title.trim() || "Untitled quiz"}
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 sm:items-end">
            {(dirty || mode === "edit") && (
              <p role="status" className="text-sm text-muted-foreground">
                {dirty ? "Unsaved changes" : "All changes saved"}
              </p>
            )}
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
