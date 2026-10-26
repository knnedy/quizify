import { getQuizResult, type ResultStatus } from "../results/mock-data";

export type QuestionType = "SINGLE" | "MULTIPLE" | "TRUE_FALSE";

export type ReviewStatus = "correct" | "incorrect" | "skipped";

export type ReviewCounts = Record<ReviewStatus, number>;

export type ReviewOption = {
  id: number;
  label: string;
  isCorrect: boolean;
  isSelected: boolean;
};

export type ReviewQuestion = {
  id: number;
  number: number;
  type: QuestionType;
  title: string;
  explanation: string | null;
  status: ReviewStatus;
  timeSpentSeconds: number | null;
  options: ReviewOption[];
};

export type QuizReview = {
  slug: string;
  title: string;
  status: ResultStatus;
  score: number;
  total: number;
  answered: number;
  percentage: number;
  questions: ReviewQuestion[];
};

type Seed = {
  type: QuestionType;
  title: string;
  explanation: string;
  options: [label: string, isCorrect: boolean][];
};

// Same questions, in the same order, as the play page mock.
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
      "The wall is thousands of kilometres long but only a few metres wide, and astronauts report that it can't be picked out from the Moon.",
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
      "Photosynthesis uses light energy to build sugars from water and carbon dioxide, and oxygen is released along the way. The other statements describe different processes.",
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
      "Printing made books cheaper and faster to produce, which spread ideas, raised literacy over time and pushed spelling toward common forms. Handwritten books continued for generations, so scribes didn't stop overnight.",
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
      "Canberra was purpose built as the capital, partly as a compromise between the rival cities of Sydney and Melbourne.",
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
    explanation:
      "Mandarin Chinese has the most native speakers of any language, ahead of Spanish and English.",
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

function hash(value: string) {
  let result = 0;
  for (const char of value) {
    result = (result * 31 + char.charCodeAt(0)) >>> 0;
  }
  return result;
}

// Positions of the options the player picked for a wrong answer. Multiple
// answer questions vary between a missed option, an extra pick and a mix.
function pickAnswer(seed: Seed, wrong: boolean, h: number) {
  const right: number[] = [];
  const other: number[] = [];

  seed.options.forEach(([, isCorrect], position) => {
    (isCorrect ? right : other).push(position);
  });

  if (!wrong) return right;
  if (seed.type !== "MULTIPLE") return [other[h % other.length]];

  const variant = h % 3;
  if (variant === 0) return right.slice(0, -1);
  if (variant === 1) return [...right, other[0]];
  return [right[0], other[0]];
}

// Built on the results mock so the score, timeout and ?score= param match
// between the two pages. The real query will return the attempt directly.
export async function getQuizReview(
  slug: string,
  options: { score?: number; timedOut?: boolean } = {},
): Promise<QuizReview | null> {
  const result = await getQuizResult(slug, options);
  if (!result) return null;

  const { total, answered, score } = result;

  const order = Array.from({ length: answered }, (_, index) => index).sort(
    (a, b) => hash(`${slug}:w${a}`) - hash(`${slug}:w${b}`),
  );
  const wrong = new Set(order.slice(0, answered - score));

  const questions = Array.from(
    { length: total },
    (_, index): ReviewQuestion => {
      const seed = seeds[index % seeds.length];
      const id = index + 1;
      const h = hash(`${slug}:${index}`);
      const isAnswered = index < answered;
      const isWrong = wrong.has(index);
      const picked = isAnswered ? pickAnswer(seed, isWrong, h) : [];

      return {
        id,
        number: id,
        type: seed.type,
        title: seed.title,
        explanation: seed.explanation,
        status: !isAnswered ? "skipped" : isWrong ? "incorrect" : "correct",
        timeSpentSeconds: isAnswered ? 3 + ((h >>> 4) % 25) : null,
        options: seed.options.map(([label, isCorrect], position) => ({
          id: id * 10 + position,
          label,
          isCorrect,
          isSelected: picked.includes(position),
        })),
      };
    },
  );

  return {
    slug: result.slug,
    title: result.title,
    status: result.status,
    score,
    total,
    answered,
    percentage: result.percentage,
    questions,
  };
}
