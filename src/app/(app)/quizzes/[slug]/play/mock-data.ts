import { listQuizzes } from "../../mock-data";

export type QuestionType = "SINGLE" | "MULTIPLE" | "TRUE_FALSE";

export type PlayOption = {
  id: number;
  label: string;
};

export type PlayQuestion = {
  id: number;
  type: QuestionType;
  title: string;
  options: PlayOption[];
};

export type PlayQuiz = {
  slug: string;
  title: string;
  timeLimitSeconds: number | null;
  questions: PlayQuestion[];
};

type Seed = [type: QuestionType, title: string, options: string[]];

const seeds: Seed[] = [
  [
    "SINGLE",
    "Which planet has the most known moons?",
    ["Mars", "Jupiter", "Saturn", "Neptune"],
  ],
  ["MULTIPLE", "Which of these numbers are prime?", ["9", "11", "15", "17"]],
  [
    "TRUE_FALSE",
    "The Great Wall of China is visible from the Moon with the naked eye.",
    ["True", "False"],
  ],
  [
    "SINGLE",
    "What is the capital of Australia?",
    ["Sydney", "Melbourne", "Canberra", "Perth"],
  ],
  [
    "MULTIPLE",
    "Which of these animals are mammals?",
    ["Dolphin", "Shark", "Bat", "Penguin"],
  ],
  [
    "TRUE_FALSE",
    "Water boils at a lower temperature at high altitude.",
    ["True", "False"],
  ],
  [
    "SINGLE",
    "Which language has the most native speakers?",
    ["English", "Spanish", "Mandarin Chinese", "Hindi"],
  ],
  [
    "SINGLE",
    "In which year did the first Moon landing happen?",
    ["1965", "1969", "1972", "1975"],
  ],
];

// Dev only: ?seconds=30 overrides the time limit so the amber and red timer
// states and the timeout can be checked without waiting minutes.
export async function getPlayQuiz(
  slug: string,
  secondsOverride?: number,
): Promise<PlayQuiz | null> {
  const { items } = await listQuizzes({ pageSize: 100 });
  const quiz = items.find((item) => item.slug === slug);
  if (!quiz) return null;

  const override =
    process.env.NODE_ENV !== "production" &&
    secondsOverride &&
    secondsOverride > 0
      ? secondsOverride
      : null;

  const questions = Array.from(
    { length: quiz.questions },
    (_, index): PlayQuestion => {
      const [type, title, options] = seeds[index % seeds.length];
      const id = index + 1;

      return {
        id,
        type,
        title,
        options: options.map((label, position) => ({
          id: id * 10 + position,
          label,
        })),
      };
    },
  );

  return {
    slug: quiz.slug,
    title: quiz.title,
    timeLimitSeconds:
      override ?? (quiz.timeLimitMinutes ? quiz.timeLimitMinutes * 60 : null),
    questions,
  };
}
