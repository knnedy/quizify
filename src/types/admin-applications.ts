export type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

export type Application = {
  id: number;
  status: ApplicationStatus;
  applicant: {
    name: string;
    email: string;
    joinedAt: Date;
    accountAgeDays: number;
    quizzesCompleted: number;
    totalXp: number;
  };
  motivation: string;
  submittedAt: Date;
  waitingDays: number;
  // 1 for a first application, 2 for the next one, and so on
  attempt: number;
  previous: { reason: string; reviewedAt: Date } | null;
  decision: {
    reviewedBy: string | null;
    reviewedAt: Date;
    reason: string | null;
  } | null;
};
