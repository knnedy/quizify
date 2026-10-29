import Link from "next/link";
import { reportReasonInfo } from "@/lib/report-reasons";
import { cn } from "@/lib/utils";
import type { Report } from "../../../reports/mock-data";
import { questionMentions } from "../report-mentions";

function ago(days: number) {
  if (days === 0) return "Today";
  return days === 1 ? "1 day ago" : `${days} days ago`;
}

export function QuizReportsCard({ reports }: { reports: Report[] }) {
  const sorted = [...reports].sort((a, b) => a.daysAgo - b.daysAgo);

  return (
    <section
      aria-labelledby="quiz-reports-heading"
      className="space-y-4 rounded-2xl border bg-card p-5 shadow-xs">
      <div className="flex items-center justify-between gap-3">
        <h2 id="quiz-reports-heading" className="text-base">
          Reports
        </h2>
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold tabular-nums">
          {reports.length}
        </span>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nobody has reported this quiz.
        </p>
      ) : (
        <ul className="space-y-4">
          {sorted.map((report) => {
            const numbers = questionMentions(report.details);
            const serious =
              report.reason === "NSFW" || report.reason === "HATE";

            return (
              <li
                key={report.id}
                className="space-y-2 border-t pt-4 first:border-t-0 first:pt-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-semibold",
                      serious
                        ? "bg-incorrect-soft text-incorrect-ink"
                        : "bg-muted text-muted-foreground",
                    )}>
                    {reportReasonInfo[report.reason].label}
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {ago(report.daysAgo)}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground tabular-nums">
                  {report.reporter.name} · {report.reporter.completed} quizzes
                </p>

                {report.details && (
                  <p className="text-sm leading-relaxed">{report.details}</p>
                )}

                {numbers.length > 0 && (
                  <p className="flex flex-wrap gap-1.5">
                    {numbers.map((number) => (
                      <a
                        key={number}
                        href={`#question-${number}`}
                        className="rounded-full bg-streak-soft px-2.5 py-0.5 text-xs font-semibold text-streak-ink transition-colors hover:bg-streak/20 focus-visible:outline-2 focus-visible:outline-ring">
                        Question {number}
                      </a>
                    ))}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <Link
        href="/admin/reports"
        className="inline-block text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
        Open the reports queue
      </Link>
    </section>
  );
}
