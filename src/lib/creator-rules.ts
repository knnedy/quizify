export const CREATOR_REQUIRED_QUIZZES = 3;
export const APPLICATION_MIN_LENGTH = 40;
export const APPLICATION_MAX_LENGTH = 500;
export const REAPPLY_AFTER_DAYS = 14;

const DAY_MS = 86_400_000;

// When a rejected applicant may apply again
export function reapplyDate(reviewedAt: Date) {
  return new Date(reviewedAt.getTime() + REAPPLY_AFTER_DAYS * DAY_MS);
}
