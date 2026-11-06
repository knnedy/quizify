import { CheckIcon, TriangleAlertIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Application } from "../mock-data";

export type Check = {
  key: string;
  label: string;
  value: string;
  note: string;
  ok: boolean;
};

const ordinals = ["First", "Second", "Third"];

function formatAge(days: number) {
  if (days < 60) return days === 1 ? "1 day" : `${days} days`;
  return `${Math.floor(days / 30)} months`;
}

export function getChecks(application: Application): Check[] {
  const { applicant, motivation, attempt } = application;
  const length = motivation.trim().length;

  const established = applicant.accountAgeDays >= 14;
  const active = applicant.quizzesCompleted >= 5;
  const detailed = length >= 60;
  const first = attempt === 1;

  return [
    {
      key: "age",
      label: "Account age",
      value: formatAge(applicant.accountAgeDays),
      ok: established,
      note: established ? "Established account" : "Under two weeks old",
    },
    {
      key: "played",
      label: "Quizzes completed",
      value: String(applicant.quizzesCompleted),
      ok: active,
      note: active
        ? `${applicant.totalXp.toLocaleString("en-US")} XP earned`
        : "Close to the minimum of 3",
    },
    {
      key: "answer",
      label: "Answer length",
      value: `${length} characters`,
      ok: detailed,
      note: detailed
        ? "Enough to judge their plans"
        : "Very short, hard to judge",
    },
    {
      key: "history",
      label: "Application",
      value: ordinals[attempt - 1] ?? `Number ${attempt}`,
      ok: first,
      note: first ? "No earlier applications" : "Rejected before",
    },
  ];
}

export function ApplicationChecks({
  application,
}: {
  application: Application;
}) {
  const checks = getChecks(application);
  const problems = checks.filter((check) => !check.ok).length;

  return (
    <section aria-labelledby="checks-heading" className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 id="checks-heading" className="text-base">
          Review checks
        </h3>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-semibold",
            problems === 0
              ? "bg-correct-soft text-correct-ink"
              : "bg-streak-soft text-streak-ink",
          )}>
          {problems === 0 ? "All clear" : `${problems} to look at`}
        </span>
      </div>

      <ul className="divide-y overflow-hidden rounded-xl border">
        {checks.map((check) => (
          <li key={check.key} className="flex items-center gap-3.5 px-4 py-3.5">
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full",
                check.ok
                  ? "bg-correct-soft text-correct-ink"
                  : "bg-streak-soft text-streak-ink",
              )}>
              {check.ok ? (
                <CheckIcon aria-hidden className="size-4 stroke-3" />
              ) : (
                <TriangleAlertIcon aria-hidden className="size-4" />
              )}
              <span className="sr-only">
                {check.ok ? "Looks fine" : "Needs a look"}
              </span>
            </span>

            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">{check.label}</span>
              <span className="block text-sm text-muted-foreground">
                {check.note}
              </span>
            </span>

            <span className="shrink-0 font-display text-base font-bold tabular-nums">
              {check.value}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
