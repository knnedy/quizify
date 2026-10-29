// Reporters often name the question they mean ("Question 6 is wrong"), so
// the preview can point straight at it.
export function questionMentions(text: string | null) {
  if (!text) return [];

  const numbers = new Set<number>();
  for (const match of text.matchAll(/\bquestions?\s+(\d{1,3})\b/gi)) {
    numbers.add(Number(match[1]));
  }

  return [...numbers];
}

export function countMentions(reports: { details: string | null }[]) {
  const counts: Record<number, number> = {};

  for (const report of reports) {
    for (const number of questionMentions(report.details)) {
      counts[number] = (counts[number] ?? 0) + 1;
    }
  }

  return counts;
}
