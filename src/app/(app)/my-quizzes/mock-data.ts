import type { Difficulty } from "@/lib/difficulty";

export type MyQuizStatus = "PUBLISHED" | "DRAFT" | "ARCHIVED" | "SUSPENDED";
export type Visibility = "PUBLIC" | "UNLISTED" | "PRIVATE";

export type MyQuiz = {
  slug: string;
  title: string;
  category: { name: string; slug: string };
  difficulty: Difficulty;
  status: MyQuizStatus;
  visibility: Visibility;
  questions: number;
  plays: number;
  avgRating: number | null;
  ratings: number;
  updatedAt: string;
  suspensionReason: string | null;
};

export type Application = {
  submittedAt: string;
  reviewedAt: string | null;
  rejectionReason: string | null;
  canReapplyAt: string | null;
};

export type CreatorSummary = {
  totalPlays: number;
  published: number;
  avgRating: number | null;
  ratings: number;
};

export type MyQuizzesView =
  | { state: "none"; completed: number; required: number }
  | { state: "pending"; application: Application }
  | { state: "rejected"; application: Application; canReapply: boolean }
  | { state: "creator"; quizzes: MyQuiz[]; summary: CreatorSummary };

export type Preview =
  | "none"
  | "pending"
  | "rejected"
  | "reapply"
  | "creator"
  | "empty";

type Row = [
  title: string,
  category: string,
  difficulty: Difficulty,
  status: MyQuizStatus,
  visibility: Visibility,
  questions: number,
  plays: number,
  rating: number | null,
  ratings: number,
  daysAgo: number,
  suspensionReason?: string,
];

const REQUIRED_QUIZZES = 3;
const DAY = 86_400_000;
const BASE = Date.parse("2026-10-20");

const previews: readonly Preview[] = [
  "none",
  "pending",
  "rejected",
  "reapply",
  "creator",
  "empty",
];

function isPreview(value: string | undefined): value is Preview {
  return previews.some((preview) => preview === value);
}

const categories: Record<string, string> = {
  geography: "Geography",
  science: "Science",
  history: "History",
  technology: "Technology",
  music: "Music",
  sports: "Sports",
  food: "Food",
};

const rows: Row[] = [
  [
    "CSS container queries",
    "technology",
    "INTERMEDIATE",
    "DRAFT",
    "PRIVATE",
    8,
    0,
    null,
    0,
    1,
  ],
  [
    "Kenyan geography",
    "geography",
    "BEGINNER",
    "PUBLISHED",
    "PUBLIC",
    15,
    3905,
    4.9,
    187,
    3,
  ],
  [
    "Benga and beyond",
    "music",
    "INTERMEDIATE",
    "SUSPENDED",
    "PUBLIC",
    10,
    480,
    4.0,
    9,
    4,
    "Several players reported this quiz. It is hidden while an admin reviews it.",
  ],
  [
    "Nairobi street food",
    "food",
    "BEGINNER",
    "PUBLISHED",
    "PUBLIC",
    12,
    1240,
    4.7,
    64,
    6,
  ],
  [
    "Safari wildlife",
    "science",
    "BEGINNER",
    "DRAFT",
    "PRIVATE",
    0,
    0,
    null,
    0,
    7,
  ],
  [
    "Git in practice",
    "technology",
    "ADVANCED",
    "PUBLISHED",
    "PUBLIC",
    15,
    3045,
    4.8,
    156,
    8,
  ],
  [
    "East African history",
    "history",
    "INTERMEDIATE",
    "PUBLISHED",
    "UNLISTED",
    18,
    212,
    4.3,
    21,
    12,
  ],
  [
    "Intro to Python",
    "technology",
    "BEGINNER",
    "PUBLISHED",
    "PUBLIC",
    10,
    410,
    4.2,
    18,
    22,
  ],
  [
    "Old Premier League trivia",
    "sports",
    "INTERMEDIATE",
    "ARCHIVED",
    "PUBLIC",
    20,
    1630,
    4.4,
    58,
    40,
  ],
  [
    "Coffee origins",
    "food",
    "ADVANCED",
    "ARCHIVED",
    "PUBLIC",
    10,
    89,
    null,
    0,
    55,
  ],
];

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function daysFromNow(days: number) {
  return new Date(BASE + days * DAY).toISOString();
}

const allQuizzes: MyQuiz[] = rows.map(
  ([
    title,
    category,
    difficulty,
    status,
    visibility,
    questions,
    plays,
    avgRating,
    ratings,
    daysAgo,
    suspensionReason,
  ]) => ({
    slug: slugify(title),
    title,
    category: { name: categories[category] ?? category, slug: category },
    difficulty,
    status,
    visibility,
    questions,
    plays,
    avgRating,
    ratings,
    updatedAt: daysFromNow(-daysAgo),
    suspensionReason: suspensionReason ?? null,
  }),
);

function summarize(quizzes: MyQuiz[]): CreatorSummary {
  const published = quizzes.filter((quiz) => quiz.status === "PUBLISHED");
  const ratings = published.reduce((sum, quiz) => sum + quiz.ratings, 0);
  const weighted = published.reduce(
    (sum, quiz) => sum + (quiz.avgRating ?? 0) * quiz.ratings,
    0,
  );

  return {
    totalPlays: quizzes.reduce((sum, quiz) => sum + quiz.plays, 0),
    published: published.length,
    avgRating: ratings > 0 ? weighted / ratings : null,
    ratings,
  };
}

// Dev only: ?as=none | pending | rejected | reapply | creator | empty forces a
// state, and ?completed=2 sets how many quizzes an applicant has finished.
// Otherwise the page shows the creator state.
export async function getMyQuizzesView(
  options: { preview?: string; completed?: number } = {},
): Promise<MyQuizzesView> {
  const dev = process.env.NODE_ENV !== "production";
  const preview: Preview =
    dev && isPreview(options.preview) ? options.preview : "creator";

  if (preview === "none") {
    return {
      state: "none",
      completed: Math.max(0, options.completed ?? 1),
      required: REQUIRED_QUIZZES,
    };
  }

  if (preview === "pending") {
    return {
      state: "pending",
      application: {
        submittedAt: daysFromNow(-2),
        reviewedAt: null,
        rejectionReason: null,
        canReapplyAt: null,
      },
    };
  }

  if (preview === "rejected" || preview === "reapply") {
    const canReapply = preview === "reapply";
    return {
      state: "rejected",
      canReapply,
      application: {
        submittedAt: daysFromNow(-16),
        reviewedAt: daysFromNow(-14),
        rejectionReason:
          "We could not tell what kind of quizzes you want to make. Tell us the topics you have in mind and why you know them well.",
        canReapplyAt: daysFromNow(canReapply ? -1 : 9),
      },
    };
  }

  const quizzes =
    preview === "empty"
      ? []
      : [...allQuizzes].sort(
          (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
        );

  return { state: "creator", quizzes, summary: summarize(quizzes) };
}
