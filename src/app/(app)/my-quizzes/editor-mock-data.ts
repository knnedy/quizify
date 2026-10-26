import type {
  CategoryOption,
  EditorQuestion,
  QuestionType,
  QuizSettings,
  QuizStatus,
} from "@/types/quiz-editor";
import { getMyQuizzesView } from "./mock-data";

export const categoryOptions: CategoryOption[] = [
  { name: "Geography", slug: "geography" },
  { name: "Science", slug: "science" },
  { name: "History", slug: "history" },
  { name: "Technology", slug: "technology" },
  { name: "Music", slug: "music" },
  { name: "Sports", slug: "sports" },
  { name: "Movies", slug: "movies" },
  { name: "Food", slug: "food" },
];

export type EditableQuiz = {
  slug: string;
  status: QuizStatus;
  suspensionReason: string | null;
  settings: QuizSettings;
  questions: EditorQuestion[];
};

type Seed = [
  type: QuestionType,
  title: string,
  explanation: string,
  options: [label: string, isCorrect: boolean][],
];

const seeds: Seed[] = [
  [
    "SINGLE",
    "Which planet has the most known moons?",
    "Saturn leads the count with well over a hundred confirmed moons.",
    [
      ["Mars", false],
      ["Jupiter", false],
      ["Saturn", true],
      ["Neptune", false],
    ],
  ],
  [
    "MULTIPLE",
    "Which of these numbers are prime?",
    "9 is 3 × 3 and 15 is 3 × 5, so only 11 and 17 have no other divisors.",
    [
      ["9", false],
      ["11", true],
      ["15", false],
      ["17", true],
    ],
  ],
  [
    "TRUE_FALSE",
    "Water boils at a lower temperature at high altitude.",
    "Air pressure drops with altitude, so water reaches its boiling point sooner.",
    [
      ["True", true],
      ["False", false],
    ],
  ],
  [
    "SINGLE",
    "Which statement best describes how photosynthesis supports life on Earth?",
    "Photosynthesis uses light to build sugars from water and carbon dioxide, and oxygen is released along the way.",
    [
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
  ],
  [
    "MULTIPLE",
    "Which of these animals are mammals?",
    "Dolphins and bats are mammals. Sharks are fish and penguins are birds.",
    [
      ["Dolphin", true],
      ["Shark", false],
      ["Bat", true],
      ["Penguin", false],
    ],
  ],
];

function hash(value: string) {
  let result = 0;
  for (const char of value) {
    result = (result * 31 + char.charCodeAt(0)) >>> 0;
  }
  return result;
}

// Built from the my quizzes mock. A draft keeps its third question
// unfinished, so the incomplete and problem states can be checked.
export async function getEditableQuiz(
  slug: string,
): Promise<EditableQuiz | null> {
  const view = await getMyQuizzesView({ preview: "creator" });
  if (view.state !== "creator") return null;

  const quiz = view.quizzes.find((item) => item.slug === slug);
  if (!quiz) return null;

  const h = hash(slug);
  const timed = quiz.questions > 0 && h % 3 !== 0;

  const questions = Array.from(
    { length: quiz.questions },
    (_, index): EditorQuestion => {
      const [type, title, explanation, options] = seeds[index % seeds.length];
      const key = `${slug}-q${index + 1}`;
      const unfinished = quiz.status === "DRAFT" && index === 2;

      return {
        key,
        type,
        title: unfinished ? "" : title,
        explanation: unfinished ? "" : explanation,
        options: options.map(([label, isCorrect], position) => ({
          key: `${key}-o${position + 1}`,
          label,
          isCorrect: unfinished ? false : isCorrect,
        })),
      };
    },
  );

  return {
    slug: quiz.slug,
    status: quiz.status,
    suspensionReason: quiz.suspensionReason,
    settings: {
      title: quiz.title,
      description: `Test what you know about ${quiz.title.toLowerCase()}.`,
      category: quiz.category.slug,
      difficulty: quiz.difficulty,
      visibility: quiz.visibility,
      timeLimitMinutes: timed ? 5 + (h % 4) * 5 : null,
      shuffleQuestions: h % 2 === 0,
      shuffleOptions: true,
      maxAttempts: h % 5 === 0 ? 3 : null,
      tags: [quiz.category.slug, "trivia"],
    },
    questions,
  };
}
