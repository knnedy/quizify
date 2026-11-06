import type { Difficulty } from "@/lib/difficulty";
import {
  getReports,
  type Report,
  type ReportedQuiz,
} from "../../reports/mock-data";

export type QuestionType = "SINGLE" | "MULTIPLE" | "TRUE_FALSE";
export type PreviewStatus = "PUBLISHED" | "HIDDEN" | "SUSPENDED" | "DELETED";
export type Visibility = "PUBLIC" | "UNLISTED" | "PRIVATE";

export type PreviewOption = { label: string; isCorrect: boolean };

export type PreviewQuestion = {
  number: number;
  type: QuestionType;
  title: string;
  explanation: string | null;
  options: PreviewOption[];
};

export type Moderation = {
  status: PreviewStatus;
  note: string | null;
  by: string | null;
  at: string | null;
};

export type QuizChange =
  | { kind: "SUSPEND"; message: string }
  | { kind: "RESTORE" }
  | { kind: "DELETE" };

export type AdminQuizPreview = {
  slug: string;
  title: string;
  description: string;
  category: { name: string; slug: string };
  creator: ReportedQuiz["creator"];
  difficulty: Difficulty;
  visibility: Visibility;
  timeLimitMinutes: number | null;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  maxAttempts: number | null;
  tags: string[];
  publishedDaysAgo: number;
  plays: number;
  avgRating: number | null;
  questions: PreviewQuestion[];
  reports: Report[];
  moderation: Moderation;
};

type Seed = {
  type: QuestionType;
  title: string;
  explanation: string | null;
  options: [label: string, isCorrect: boolean][];
};

const difficulties: Difficulty[] = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];

const tagPool: Record<string, string[]> = {
  geography: ["maps", "capitals", "countries", "landmarks", "africa"],
  science: ["space", "chemistry", "biology", "physics", "lab"],
  history: ["empires", "timelines", "wars", "civilizations", "leaders"],
  technology: ["javascript", "css", "git", "web", "coding"],
  music: ["theory", "rock", "chords", "instruments", "ear training"],
  sports: ["football", "olympics", "records", "athletes", "running"],
  movies: ["awards", "classics", "quotes", "animation", "sci-fi"],
  food: ["street food", "coffee", "spices", "cooking", "cuisine"],
};

const seeds: Seed[] = [
  {
    type: "SINGLE",
    title: "Which planet has the most known moons?",
    explanation:
      "Saturn leads the count with well over a hundred confirmed moons.",
    options: [
      ["Mars", false],
      ["Jupiter", false],
      ["Saturn", true],
      ["Neptune", false],
    ],
  },
  {
    type: "MULTIPLE",
    title: "Which of these numbers are prime?",
    explanation:
      "9 is 3 × 3 and 15 is 3 × 5, so only 11 and 17 have no divisors besides 1 and themselves.",
    options: [
      ["9", false],
      ["11", true],
      ["15", false],
      ["17", true],
    ],
  },
  {
    type: "TRUE_FALSE",
    title:
      "The Great Wall of China is visible from the Moon with the naked eye.",
    explanation:
      "The wall is thousands of kilometres long but only a few metres wide, so it can't be picked out from the Moon.",
    options: [
      ["True", false],
      ["False", true],
    ],
  },
  {
    type: "SINGLE",
    title:
      "Which statement best describes how photosynthesis supports life on Earth?",
    explanation:
      "Photosynthesis uses light energy to build sugars from water and carbon dioxide, and oxygen is released along the way.",
    options: [
      [
        "It converts sunlight, water and carbon dioxide into sugars and releases oxygen as a by-product",
        true,
      ],
      [
        "It breaks down sugars in the dark to release the energy that plants need to grow",
        false,
      ],
      [
        "It absorbs nitrogen from the air and turns it into proteins that animals can eat directly",
        false,
      ],
      [
        "It stores heat in leaves during the day so that plants stay warm through the night",
        false,
      ],
    ],
  },
  {
    type: "MULTIPLE",
    title:
      "Which of these were direct consequences of the printing press in Europe?",
    explanation:
      "Printing made books cheaper and faster to produce, which spread ideas, raised literacy over time and pushed spelling toward common forms.",
    options: [
      [
        "Ideas and religious texts spread much faster and reached far more readers than hand copying allowed",
        true,
      ],
      [
        "Literacy rates rose over the following centuries as books became cheaper to produce",
        true,
      ],
      [
        "Scribes and monasteries immediately stopped producing any handwritten books at all",
        false,
      ],
      [
        "Standardised spelling and grammar gradually emerged as printers settled on common forms",
        true,
      ],
    ],
  },
  {
    type: "SINGLE",
    title: "What is the capital of Australia?",
    explanation:
      "Canberra was purpose built as the capital, partly as a compromise between Sydney and Melbourne.",
    options: [
      ["Sydney", false],
      ["Melbourne", false],
      ["Canberra", true],
      ["Perth", false],
    ],
  },
  {
    type: "MULTIPLE",
    title: "Which of these animals are mammals?",
    explanation:
      "Dolphins and bats are mammals. Sharks are fish and penguins are birds.",
    options: [
      ["Dolphin", true],
      ["Shark", false],
      ["Bat", true],
      ["Penguin", false],
    ],
  },
  {
    type: "TRUE_FALSE",
    title: "Water boils at a lower temperature at high altitude.",
    explanation:
      "Air pressure drops with altitude, so water reaches its boiling point at a lower temperature.",
    options: [
      ["True", true],
      ["False", false],
    ],
  },
  {
    type: "SINGLE",
    title: "Which language has the most native speakers?",
    explanation: null,
    options: [
      ["English", false],
      ["Spanish", false],
      ["Mandarin Chinese", true],
      ["Hindi", false],
    ],
  },
  {
    type: "SINGLE",
    title: "In which year did the first Moon landing happen?",
    explanation: "Apollo 11 landed on the Moon in July 1969.",
    options: [
      ["1965", false],
      ["1969", true],
      ["1972", false],
      ["1975", false],
    ],
  },
];

// Hand written problems that match what the mock reporters say, so the
// preview has something real to find.
const overrides: Record<string, Record<number, Seed>> = {
  "solar-system-essentials": {
    0: {
      type: "SINGLE",
      title: "Which planet has the most known moons?",
      explanation:
        "Saturn leads the count with well over a hundred confirmed moons.",
      options: [
        ["Mars", false],
        ["Jupiter", true],
        ["Saturn", false],
        ["Neptune", false],
      ],
    },
    2: {
      type: "SINGLE",
      title: "Which planet is ninth from the Sun?",
      explanation:
        "Pluto orbits beyond Neptune, at the edge of the solar system.",
      options: [
        ["Pluto", true],
        ["Neptune", false],
        ["Uranus", false],
        ["Eris", false],
      ],
    },
  },
};

function hash(value: string) {
  let result = 0;
  for (const char of value) {
    result = (result * 31 + char.charCodeAt(0)) >>> 0;
  }
  return result;
}

function buildQuestions(slug: string, count: number): PreviewQuestion[] {
  return Array.from({ length: count }, (_, index): PreviewQuestion => {
    const seed = overrides[slug]?.[index] ?? seeds[index % seeds.length];

    return {
      number: index + 1,
      type: seed.type,
      title: seed.title,
      explanation: seed.explanation,
      options: seed.options.map(([label, isCorrect]) => ({ label, isCorrect })),
    };
  });
}

function baseModeration(item: ReportedQuiz): Moderation {
  const decision = item.decision;

  switch (item.status) {
    case "SUSPENDED":
      return {
        status: "SUSPENDED",
        note: decision?.note ?? null,
        by: decision?.by ?? null,
        at: decision?.at ?? null,
      };
    case "DELETED":
      return {
        status: "DELETED",
        note: decision?.note ?? null,
        by: decision?.by ?? null,
        at: decision?.at ?? null,
      };
    case "DISMISSED":
      return { status: "PUBLISHED", note: null, by: null, at: null };
    case "OPEN":
      return {
        status: item.hiddenAutomatically ? "HIDDEN" : "PUBLISHED",
        note: null,
        by: null,
        at: null,
      };
  }
}

// Stand-in for the real quiz query, which an admin can run on any quiz
// whatever its status. Players never get the correct answers.
export async function getAdminQuiz(
  slug: string,
): Promise<AdminQuizPreview | null> {
  const { items } = await getReports();
  const item = items.find((entry) => entry.quiz.slug === slug);
  if (!item) return null;

  const { quiz, creator } = item;
  const h = hash(slug);
  const pool = tagPool[quiz.category.slug] ?? [];

  return {
    slug: quiz.slug,
    title: quiz.title,
    description: `Test what you know about ${quiz.title.toLowerCase()}.`,
    category: quiz.category,
    creator,
    difficulty: difficulties[h % difficulties.length],
    visibility: "PUBLIC",
    timeLimitMinutes: h % 3 === 0 ? null : 5 + (h % 4) * 5,
    shuffleQuestions: h % 2 === 0,
    shuffleOptions: true,
    maxAttempts: h % 5 === 0 ? 3 : null,
    tags:
      pool.length > 0 ? [0, 1, 2].map((i) => pool[(h + i) % pool.length]) : [],
    publishedDaysAgo: quiz.publishedDaysAgo,
    plays: quiz.plays,
    avgRating: quiz.avgRating,
    questions: buildQuestions(quiz.slug, quiz.questions),
    reports: item.reports,
    moderation: baseModeration(item),
  };
}

// Stand-in for what the real suspend, restore and delete actions do. The
// screen keeps a list of changes and replays them here, so an undo is just
// dropping the last one.
export function applyModeration(
  base: Moderation,
  changes: QuizChange[],
): Moderation {
  let result = base;

  for (const change of changes) {
    switch (change.kind) {
      case "SUSPEND":
        result = {
          status: "SUSPENDED",
          note: change.message,
          by: "you",
          at: null,
        };
        break;
      case "RESTORE":
        result = { status: "PUBLISHED", note: null, by: "you", at: null };
        break;
      case "DELETE":
        result = { status: "DELETED", note: null, by: "you", at: null };
        break;
    }
  }

  return result;
}
