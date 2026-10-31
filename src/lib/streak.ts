// The calendar day of a moment in the user's own time zone, as YYYY-MM-DD
function dayKey(date: Date, timeZone: string) {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

function dayNumber(key: string) {
  return Date.parse(`${key}T00:00:00Z`) / 86_400_000;
}

// The streak after activity at `now`. Same day keeps it, the next day extends
// it, and any longer gap starts it again at 1.
export function nextStreak({
  lastActivity,
  current,
  now,
  timeZone,
}: {
  lastActivity: Date | null;
  current: number;
  now: Date;
  timeZone: string;
}) {
  if (!lastActivity) return 1;

  const gap =
    dayNumber(dayKey(now, timeZone)) -
    dayNumber(dayKey(lastActivity, timeZone));

  if (gap <= 0) return Math.max(current, 1);
  if (gap === 1) return current + 1;
  return 1;
}
