import { cn } from "@/lib/utils";
import type { LibraryKey, LibrarySlice } from "../mock-data";

const colors: Record<LibraryKey, string> = {
  published: "bg-primary",
  drafts: "bg-primary/40",
  archived: "bg-muted-foreground/35",
  suspended: "bg-incorrect",
};

export function LibraryCard({ slices }: { slices: LibrarySlice[] }) {
  const total = slices.reduce((sum, slice) => sum + slice.count, 0);
  const shown = slices.filter((slice) => slice.count > 0);

  return (
    <section
      aria-labelledby="library-heading"
      className="rounded-2xl border bg-card p-5 shadow-xs sm:p-6">
      <div className="space-y-1">
        <h2 id="library-heading" className="text-xl">
          Quiz library
        </h2>
        <p className="text-sm text-muted-foreground">Every quiz, by status.</p>
      </div>

      <div className="mt-6 flex items-baseline gap-2">
        <p className="font-display text-5xl leading-none font-bold tabular-nums">
          {total}
        </p>
        <p className="text-sm text-muted-foreground">quizzes in total</p>
      </div>

      <div
        role="img"
        aria-label={shown
          .map((slice) => `${slice.label}: ${slice.count}`)
          .join(", ")}
        className="mt-5 flex h-3 gap-0.5 overflow-hidden rounded-full">
        {shown.map((slice) => (
          <span
            key={slice.key}
            className={cn(
              "basis-0 first:rounded-l-full last:rounded-r-full",
              colors[slice.key],
            )}
            style={{ flexGrow: slice.count }}
          />
        ))}
      </div>

      <ul className="mt-6 space-y-3.5">
        {slices.map((slice) => {
          const share = total > 0 ? Math.round((slice.count / total) * 100) : 0;

          return (
            <li key={slice.key} className="flex items-center gap-3 text-sm">
              <span
                aria-hidden
                className={cn(
                  "size-3 shrink-0 rounded-full",
                  colors[slice.key],
                )}
              />
              <span className="min-w-0 flex-1 truncate">{slice.label}</span>
              <span className="text-muted-foreground tabular-nums">
                {share}%
              </span>
              <span className="w-9 text-right font-medium tabular-nums">
                {slice.count}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
