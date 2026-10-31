import type { QuizCardData } from "@/components/quiz/quiz-card";
import type { Difficulty } from "@/lib/difficulty";
import type { QuizSort } from "@/lib/quiz-browse";

type Row = [
  title: string,
  description: string,
  category: string,
  difficulty: Difficulty,
  questions: number,
  minutes: number | null,
  rating: number | null,
  ratings: number,
  plays: number,
  author: string | null,
  daysAgo: number,
];

const categoryDefs = [
  { name: "Geography", slug: "geography" },
  { name: "Science", slug: "science" },
  { name: "History", slug: "history" },
  { name: "Technology", slug: "technology" },
  { name: "Music", slug: "music" },
  { name: "Sports", slug: "sports" },
  { name: "Movies", slug: "movies" },
  { name: "Food", slug: "food" },
];

const rows: Row[] = [
  [
    "Capital cities of Africa",
    "Match every capital to its country, from Nairobi to Windhoek.",
    "geography",
    "BEGINNER",
    12,
    6,
    4.8,
    214,
    4812,
    "Amina W.",
    3,
  ],
  [
    "Solar system essentials",
    "From the rocky inner planets to the ice giants at the edge.",
    "science",
    "INTERMEDIATE",
    10,
    5,
    4.6,
    168,
    3120,
    "Brian O.",
    5,
  ],
  [
    "The scramble for Africa",
    "Treaties, borders and resistance movements, with no easy answers.",
    "history",
    "ADVANCED",
    20,
    15,
    4.4,
    61,
    1290,
    "Wanjiku M.",
    9,
  ],
  [
    "JavaScript gotchas",
    "Hoisting, coercion and closures. Can you predict the output?",
    "technology",
    "INTERMEDIATE",
    15,
    10,
    4.7,
    302,
    5240,
    "Kevin N.",
    2,
  ],
  [
    "Name that chord",
    "Major, minor, seventh. Test your ear and your theory.",
    "music",
    "BEGINNER",
    10,
    5,
    4.5,
    44,
    980,
    "Zawadi K.",
    12,
  ],
  [
    "World Cup trivia",
    "Finals, upsets and golden boots from every tournament.",
    "sports",
    "BEGINNER",
    15,
    8,
    4.7,
    389,
    6015,
    "Otieno J.",
    1,
  ],
  [
    "Flags of the world",
    "Identify 30 national flags before the timer runs out.",
    "geography",
    "INTERMEDIATE",
    30,
    12,
    4.5,
    127,
    2890,
    "Amina W.",
    14,
  ],
  [
    "The periodic table",
    "Symbols, groups and a few surprises from the lab.",
    "science",
    "ADVANCED",
    25,
    15,
    4.3,
    52,
    1104,
    "Dr. Njeri",
    21,
  ],
  [
    "Ancient Egypt",
    "Pharaohs, pyramids and the river that fed an empire.",
    "history",
    "BEGINNER",
    12,
    null,
    4.6,
    98,
    2210,
    "Brian O.",
    18,
  ],
  [
    "CSS layout showdown",
    "Flexbox versus grid, specificity and the cascade.",
    "technology",
    "BEGINNER",
    12,
    8,
    4.4,
    76,
    1760,
    "Kevin N.",
    7,
  ],
  [
    "Classic rock riffs",
    "Name the song from its opening riff.",
    "music",
    "INTERMEDIATE",
    15,
    9,
    4.2,
    39,
    870,
    "Zawadi K.",
    25,
  ],
  [
    "Marathon legends",
    "Records, rivals and the runners who changed the sport.",
    "sports",
    "INTERMEDIATE",
    15,
    10,
    4.6,
    83,
    1640,
    "Otieno J.",
    16,
  ],
  [
    "Oscar-winning films",
    "Best picture winners and the stories behind them.",
    "movies",
    "INTERMEDIATE",
    20,
    12,
    4.5,
    145,
    3320,
    "Lucy A.",
    6,
  ],
  [
    "Street food around the world",
    "Where does this dish come from? Eat your way through 12 countries.",
    "food",
    "BEGINNER",
    12,
    6,
    4.7,
    112,
    2540,
    "Faith M.",
    4,
  ],
  [
    "Rivers and mountains",
    "Longest, tallest and deepest: the geography of extremes.",
    "geography",
    "ADVANCED",
    20,
    14,
    4.1,
    33,
    760,
    "Hassan D.",
    30,
  ],
  [
    "Human body basics",
    "Organs, systems and what they do all day.",
    "science",
    "BEGINNER",
    15,
    8,
    4.8,
    201,
    4375,
    "Dr. Njeri",
    10,
  ],
  [
    "World War II timeline",
    "Put the major events in the right order.",
    "history",
    "ADVANCED",
    25,
    18,
    4.5,
    91,
    1980,
    "Wanjiku M.",
    20,
  ],
  [
    "Git in practice",
    "Branches, rebases and recovering from mistakes.",
    "technology",
    "ADVANCED",
    15,
    12,
    4.8,
    156,
    3045,
    "Kevin N.",
    8,
  ],
  [
    "Sci-fi movie quotes",
    "Which film said it? From classics to modern hits.",
    "movies",
    "BEGINNER",
    15,
    7,
    4.3,
    58,
    1420,
    "Lucy A.",
    11,
  ],
  [
    "Coffee from bean to cup",
    "Origins, roasts and brewing methods.",
    "food",
    "INTERMEDIATE",
    10,
    null,
    4.4,
    37,
    890,
    "Faith M.",
    27,
  ],
  [
    "Olympic Games history",
    "Host cities, record breakers and unforgettable moments.",
    "sports",
    "INTERMEDIATE",
    20,
    13,
    4.6,
    104,
    2275,
    "Otieno J.",
    13,
  ],
  [
    "Music theory fundamentals",
    "Scales, intervals and reading a key signature.",
    "music",
    "ADVANCED",
    20,
    15,
    4.7,
    29,
    640,
    "Zawadi K.",
    19,
  ],
  [
    "Kenyan geography",
    "Counties, lakes and national parks across Kenya.",
    "geography",
    "BEGINNER",
    15,
    8,
    4.9,
    187,
    3905,
    "Amina W.",
    15,
  ],
  [
    "Python or pseudocode?",
    "Read the snippet and spot what it prints.",
    "technology",
    "BEGINNER",
    10,
    6,
    4.2,
    18,
    410,
    null,
    22,
  ],
  [
    "Animated movie sidekicks",
    "Match the sidekick to the hero, no spoilers.",
    "movies",
    "BEGINNER",
    12,
    6,
    null,
    0,
    95,
    "Lucy A.",
    0,
  ],
  [
    "Spice route trivia",
    "How spices shaped trade, cuisine and empires.",
    "food",
    "ADVANCED",
    15,
    null,
    null,
    0,
    140,
    "Hassan D.",
    1,
  ],
];

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const DAY = 86_400_000;
const BASE = Date.parse("2026-10-20");

const entries = rows.map((row, index) => {
  const [
    title,
    description,
    categorySlug,
    difficulty,
    questions,
    minutes,
    rating,
    ratings,
    plays,
    author,
    daysAgo,
  ] = row;
  const category =
    categoryDefs.find((c) => c.slug === categorySlug) ?? categoryDefs[0];

  const quiz: QuizCardData = {
    slug: slugify(title),
    title,
    description,
    category,
    difficulty,
    questions,
    timeLimitMinutes: minutes,
    avgRating: rating,
    ratings,
    plays,
    author: author ? { name: author } : null,
    isBookmarked: index % 5 === 0,
  };

  return { quiz, createdAt: BASE - daysAgo * DAY };
});

export async function listCategories() {
  return categoryDefs.map((category) => ({
    ...category,
    count: entries.filter((e) => e.quiz.category.slug === category.slug).length,
  }));
}

export async function listQuizzes(params: {
  search?: string;
  category?: string;
  difficulty?: Difficulty;
  sort?: QuizSort;
  page?: number;
  pageSize?: number;
  exclude?: string;
}) {
  const pageSize = params.pageSize ?? 12;
  const term = params.search?.toLowerCase();

  const matches = entries.filter(({ quiz }) => {
    if (params.exclude && quiz.slug === params.exclude) return false;
    if (params.category && quiz.category.slug !== params.category) return false;
    if (params.difficulty && quiz.difficulty !== params.difficulty)
      return false;
    if (
      term &&
      !quiz.title.toLowerCase().includes(term) &&
      !quiz.description.toLowerCase().includes(term)
    ) {
      return false;
    }
    return true;
  });

  matches.sort((a, b) => {
    if (params.sort === "popular") return b.quiz.plays - a.quiz.plays;
    if (params.sort === "top-rated") {
      return (
        (b.quiz.avgRating ?? -1) - (a.quiz.avgRating ?? -1) ||
        b.quiz.ratings - a.quiz.ratings
      );
    }
    return b.createdAt - a.createdAt;
  });

  const total = matches.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(params.page ?? 1, 1), pageCount);
  const items = matches
    .slice((page - 1) * pageSize, page * pageSize)
    .map((entry) => entry.quiz);

  return { items, total, page, pageSize, pageCount };
}
