export const CREATOR_REQUIRED_QUIZZES = 3;
export const APPLICATION_MIN_LENGTH = 40;
export const APPLICATION_MAX_LENGTH = 500;
export const REAPPLY_AFTER_DAYS = 14;

// What staff look at when they review an application
export const REVIEW_MIN_ACCOUNT_DAYS = 14;
export const REVIEW_MIN_QUIZZES = 5;
export const REVIEW_MIN_ANSWER_LENGTH = 60;

export const REJECTION_REASON_MIN = 10;
export const REJECTION_REASON_MAX = 300;

const DAY_MS = 86_400_000;

// When a rejected applicant may apply again
export function reapplyDate(reviewedAt: Date) {
  return new Date(reviewedAt.getTime() + REAPPLY_AFTER_DAYS * DAY_MS);
}
