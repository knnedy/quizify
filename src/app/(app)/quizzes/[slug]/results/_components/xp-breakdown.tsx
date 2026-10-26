import { XpChip } from "@/components/xp-chip";
import type { XpLine } from "../mock-data";

export function XpBreakdown({
  lines,
  total,
}: {
  lines: XpLine[];
  total: number;
}) {
  return (
    <section
      aria-labelledby="xp-heading"
      className="flex flex-col gap-5 rounded-2xl border bg-card p-6 shadow-xs">
      <h2 id="xp-heading" className="text-xl">
        XP earned
      </h2>

      {total === 0 ? (
        <p className="text-sm text-muted-foreground">
          No XP this time. Every correct answer earns XP, so go again and see
          how many you can get.
        </p>
      ) : (
        <>
          <ul className="space-y-3">
            {lines.map((line) => (
              <li
                key={line.label}
                className="flex items-baseline justify-between gap-4">
                <span className="min-w-0">
                  <span className="font-medium">{line.label}</span>
                  {line.detail && (
                    <span className="block text-sm text-muted-foreground tabular-nums">
                      {line.detail}
                    </span>
                  )}
                </span>
                <span className="shrink-0 font-display font-bold text-xp-ink tabular-nums">
                  +{line.amount}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-auto flex items-center justify-between gap-4 border-t pt-4">
            <span className="font-medium text-muted-foreground">Total</span>
            <XpChip className="px-3.5 py-1.5 text-base">+{total} XP</XpChip>
          </div>
        </>
      )}
    </section>
  );
}
