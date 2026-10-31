export function attemptDeadline(
  startedAt: Date,
  timeLimitSeconds: number | null,
) {
  if (timeLimitSeconds === null) return null;
  return new Date(startedAt.getTime() + timeLimitSeconds * 1000);
}

export function isExpired(
  startedAt: Date,
  timeLimitSeconds: number | null,
  now: Date = new Date(),
) {
  const deadline = attemptDeadline(startedAt, timeLimitSeconds);
  return deadline !== null && now.getTime() >= deadline.getTime();
}

export function remainingSeconds(
  startedAt: Date,
  timeLimitSeconds: number | null,
  now: Date = new Date(),
) {
  const deadline = attemptDeadline(startedAt, timeLimitSeconds);
  if (deadline === null) return null;
  return Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / 1000));
}
