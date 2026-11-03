const DAY_MS = 86_400_000;

// The calendar day of a moment in the user's own time zone, as YYYY-MM-DD
export function dayKey(date: Date, timeZone: string) {
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
  return Date.parse(`${key}T00:00:00Z`) / DAY_MS;
}

// How many calendar days ago a moment was, in the user's time zone
export function calendarDaysAgo(date: Date, now: Date, timeZone: string) {
  return Math.max(
    0,
    dayNumber(dayKey(now, timeZone)) - dayNumber(dayKey(date, timeZone)),
  );
}

// The last `count` calendar days in the user's time zone, oldest first and
// ending today, as YYYY-MM-DD
export function lastDays(now: Date, timeZone: string, count: number) {
  const today = dayNumber(dayKey(now, timeZone));

  return Array.from({ length: count }, (_, index) =>
    new Date((today - (count - 1 - index)) * DAY_MS).toISOString().slice(0, 10),
  );
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

// The streak to show right now. A stored streak only holds while the last
// activity was today or yesterday.
export function activeStreak({
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
  if (!lastActivity) return 0;

  const gap =
    dayNumber(dayKey(now, timeZone)) -
    dayNumber(dayKey(lastActivity, timeZone));

  return gap <= 1 ? current : 0;
}
