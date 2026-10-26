export const reportReasons = [
  "NSFW",
  "HATE",
  "SPAM",
  "MISLEADING",
  "COPYRIGHT",
  "OTHER",
] as const;

export type ReportReason = (typeof reportReasons)[number];

export const reportDetailsMax = 300;

export const reportReasonInfo: Record<
  ReportReason,
  { label: string; description: string }
> = {
  NSFW: {
    label: "Sexual or graphic content",
    description: "Not suitable for a general audience.",
  },
  HATE: {
    label: "Hate or harassment",
    description: "Attacks or targets a person or a group.",
  },
  SPAM: {
    label: "Spam",
    description: "Ads, junk or a quiz that only exists to promote something.",
  },
  MISLEADING: {
    label: "Misleading or wrong",
    description: "Answers that are clearly incorrect or deceptive.",
  },
  COPYRIGHT: {
    label: "Copyright",
    description: "Copied from someone else's work.",
  },
  OTHER: {
    label: "Something else",
    description: "Tell us more below.",
  },
};
