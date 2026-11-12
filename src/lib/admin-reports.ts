import type { ReportReason } from "@/lib/report-reasons";
import type { QuizVisibility } from "@/types/admin-reports";

// A reporter with this many finished quizzes counts as an established player
export const ESTABLISHED_REPORTER_QUIZZES = 5;

const seriousReasons: readonly ReportReason[] = ["NSFW", "HATE"];

export function isSerious(reason: ReportReason) {
  return seriousReasons.includes(reason);
}

type WithReports = {
  reports: { reason: ReportReason; daysAgo: number }[];
};

export function oldestDays(item: WithReports) {
  return Math.max(0, ...item.reports.map((report) => report.daysAgo));
}

export function reasonCounts(reports: { reason: ReportReason }[]) {
  const counts = new Map<ReportReason, number>();

  for (const report of reports) {
    counts.set(report.reason, (counts.get(report.reason) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count);
}

// Serious reasons first, then the most reports, then the longest wait
export function compareOpenReports(a: WithReports, b: WithReports) {
  const serious = (item: WithReports) =>
    Number(item.reports.some((report) => isSerious(report.reason)));

  return (
    serious(b) - serious(a) ||
    b.reports.length - a.reports.length ||
    oldestDays(b) - oldestDays(a)
  );
}

// Only a live quiz, or one hidden automatically, can be suspended
export function canSuspendQuiz(visibility: QuizVisibility) {
  return visibility === "LIVE" || visibility === "HIDDEN_AUTO";
}

export function ago(days: number) {
  if (days === 0) return "Today";
  return days === 1 ? "1 day ago" : `${days} days ago`;
}
