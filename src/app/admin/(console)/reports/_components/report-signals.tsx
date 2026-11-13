import { CheckIcon, TriangleAlertIcon } from "lucide-react";
import { ESTABLISHED_REPORTER_QUIZZES, isSerious } from "@/lib/admin-reports";
import { cn } from "@/lib/utils";
import type { ReportedQuiz } from "@/types/admin-reports";

type Signal = {
  key: string;
  label: string;
  note: string;
  value: string;
  concern: boolean;
};

function visibilitySignal(item: ReportedQuiz, total: number): Signal {
  switch (item.visibility) {
    case "HIDDEN_AUTO":
      return {
        key: "visibility",
        label: "Visibility",
        value: "Hidden",
        note: "Hidden from players until you decide",
        concern: false,
      };
    case "HIDDEN_STAFF":
      return {
        key: "visibility",
        label: "Visibility",
        value: "Suspended",
        note: "Already suspended by staff",
        concern: false,
      };
    case "UNPUBLISHED":
      return {
        key: "visibility",
        label: "Visibility",
        value: "Unpublished",
        note: "The creator has taken it down",
        concern: false,
      };
    default:
      return {
        key: "visibility",
        label: "Visibility",
        value: "Live",
        note:
          total >= 2
            ? "Still visible to players while reported"
            : "Still visible, with a single report",
        concern: total >= 2,
      };
  }
}

export function getSignals(item: ReportedQuiz): Signal[] {
  const total = item.reports.length;
  const established = item.reports.filter(
    (report) => report.reporter.completed >= ESTABLISHED_REPORTER_QUIZZES,
  ).length;
  const serious = item.reports.some((report) => isSerious(report.reason));
  const { creator } = item;

  return [
    {
      key: "reporters",
      label: "Reporters",
      value: String(total),
      note: `${established} established ${established === 1 ? "player" : "players"}, ${total - established} new ${total - established === 1 ? "account" : "accounts"}`,
      concern: established >= 2,
    },
    {
      key: "severity",
      label: "Severity",
      value: serious ? "Serious" : "Standard",
      note: serious
        ? "Includes sexual, graphic or hateful reports"
        : "No sexual, graphic or hateful reports",
      concern: serious,
    },
    creator
      ? {
          key: "creator",
          label: "Creator history",
          value: String(creator.strikes),
          note:
            creator.strikes > 0
              ? `${creator.strikes === 1 ? "1 earlier action" : `${creator.strikes} earlier actions`} against ${creator.name.split(" ")[0]}`
              : "No earlier actions",
          concern: creator.strikes > 0,
        }
      : {
          key: "creator",
          label: "Creator history",
          value: "None",
          note: "The creator's account was deleted",
          concern: false,
        },
    visibilitySignal(item, total),
  ];
}

export function ReportSignals({ item }: { item: ReportedQuiz }) {
  const signals = getSignals(item);
  const concerns = signals.filter((signal) => signal.concern).length;

  return (
    <section aria-labelledby="signals-heading" className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 id="signals-heading" className="text-base">
          What stands out
        </h3>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-semibold",
            concerns === 0
              ? "bg-correct-soft text-correct-ink"
              : "bg-streak-soft text-streak-ink",
          )}>
          {concerns === 0 ? "Nothing stands out" : `${concerns} worth noting`}
        </span>
      </div>

      <ul className="divide-y overflow-hidden rounded-xl border">
        {signals.map((signal) => (
          <li
            key={signal.key}
            className="flex items-center gap-3.5 px-4 py-3.5">
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full",
                signal.concern
                  ? "bg-streak-soft text-streak-ink"
                  : "bg-muted text-muted-foreground",
              )}>
              {signal.concern ? (
                <TriangleAlertIcon aria-hidden className="size-4" />
              ) : (
                <CheckIcon aria-hidden className="size-4 stroke-3" />
              )}
              <span className="sr-only">
                {signal.concern ? "Worth noting" : "Nothing unusual"}
              </span>
            </span>

            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">{signal.label}</span>
              <span className="block text-sm text-muted-foreground">
                {signal.note}
              </span>
            </span>

            <span className="shrink-0 font-display text-base font-bold tabular-nums">
              {signal.value}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
