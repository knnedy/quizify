// A ban counts while it has no end date, or its end date is still ahead
export function isCurrentlyBanned(
  banned: boolean | null | undefined,
  banExpires: Date | string | null | undefined,
  now: Date = new Date(),
) {
  if (!banned) return false;
  if (!banExpires) return true;

  return new Date(banExpires).getTime() > now.getTime();
}
