import type { ReportedQuiz } from "../mock-data";

export function ago(days: number) {
  if (days === 0) return "Today";
  return days === 1 ? "1 day ago" : `${days} days ago`;
}

export function oldestDays(item: ReportedQuiz) {
  return Math.max(...item.reports.map((report) => report.daysAgo));
}
