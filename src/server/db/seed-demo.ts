import { eq, inArray, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { difficultyInfo } from "../../lib/difficulty";
import {
  attemptAnswers,
  categories,
  questionOptions,
  questions,
  quizAttempts,
  quizBookmarks,
  quizRatings,
  quizzes,
  users,
} from "./schema";

if (process.env.NODE_ENV === "production") {
  throw new Error("The demo seed is for development only");
}

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const client = postgres(url, { max: 1 });
const db = drizzle(client);

const DEMO_DOMAIN = "@demo.quizify.test";
const HOUR = 3_600_000;
const DAY = 24 * HOUR;

type QuestionType = "SINGLE" | "MULTIPLE" | "TRUE_FALSE";

type QuestionSeed = [
  title: string,
  type: QuestionType,
  options: string[],
  correct: number[],
  explanation?: string,
];

type QuizSeed = {
  title: string;
  description: string;
  category: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  minutes: number | null;
  author: string;
  daysAgo: number;
  questions: QuestionSeed[];
};

const single = (
  title: string,
  options: string[],
  correct: number,
  explanation?: string,
): QuestionSeed => [title, "SINGLE", options, [correct], explanation];

const multiple = (
  title: string,
  options: string[],
  correct: number[],
  explanation?: string,
): QuestionSeed => [title, "MULTIPLE", options, correct, explanation];

const trueFalse = (
  title: string,
  answer: boolean,
  explanation?: string,
): QuestionSeed => [
  title,
  "TRUE_FALSE",
  ["True", "False"],
  [answer ? 0 : 1],
  explanation,
];

const authorNames = [
  "Amina W.",
  "Brian O.",
  "Wanjiku M.",
  "Kevin N.",
  "Zawadi K.",
  "Otieno J.",
  "Lucy A.",
  "Faith M.",
];

const playerNames = [
  "Hassan D.",
  "Dr. Njeri",
  "Peter K.",
  "Grace M.",
  "Samuel T.",
  "Esther N.",
  "David O.",
  "Mercy W.",
  "Joseph L.",
  "Ruth A.",
  "Daniel C.",
  "Naomi B.",
];

const quizSeeds: QuizSeed[] = [
  {
    title: "Capital cities of Africa",
    description:
      "Match every capital to its country, from Nairobi to Windhoek.",
    category: "geography",
    difficulty: "BEGINNER",
    minutes: 6,
    author: "Amina W.",
    daysAgo: 3,
    questions: [
      single(
        "What is the capital of Kenya?",
        ["Mombasa", "Nairobi", "Kisumu", "Nakuru"],
        1,
      ),
      single(
        "What is the capital of Egypt?",
        ["Alexandria", "Giza", "Cairo", "Luxor"],
        2,
      ),
      single(
        "What is the capital of Nigeria?",
        ["Lagos", "Abuja", "Kano", "Ibadan"],
        1,
        "Abuja replaced Lagos as the capital in 1991.",
      ),
      single(
        "What is the capital of Namibia?",
        ["Walvis Bay", "Windhoek", "Swakopmund", "Lüderitz"],
        1,
      ),
      trueFalse("Addis Ababa is the capital of Ethiopia.", true),
    ],
  },
  {
    title: "Solar system essentials",
    description: "From the rocky inner planets to the ice giants at the edge.",
    category: "science",
    difficulty: "INTERMEDIATE",
    minutes: 5,
    author: "Brian O.",
    daysAgo: 5,
    questions: [
      single(
        "Which planet is closest to the Sun?",
        ["Venus", "Mercury", "Mars", "Earth"],
        1,
      ),
      multiple(
        "Which of these are gas giants?",
        ["Jupiter", "Mars", "Saturn", "Mercury"],
        [0, 2],
        "Uranus and Neptune are usually called ice giants.",
      ),
      single(
        "Which is the largest planet in the solar system?",
        ["Saturn", "Neptune", "Jupiter", "Uranus"],
        2,
      ),
      trueFalse(
        "Venus is the hottest planet in the solar system.",
        true,
        "Its thick atmosphere traps heat, even though Mercury is closer to the Sun.",
      ),
      single(
        "How many planets are in the solar system?",
        ["7", "8", "9", "10"],
        1,
      ),
    ],
  },
  {
    title: "The scramble for Africa",
    description:
      "Treaties, borders and resistance movements, with no easy answers.",
    category: "history",
    difficulty: "ADVANCED",
    minutes: 15,
    author: "Wanjiku M.",
    daysAgo: 9,
    questions: [
      single(
        "In which year did the Berlin Conference begin?",
        ["1814", "1884", "1919", "1960"],
        1,
      ),
      single(
        "Which of these countries kept its independence through the scramble?",
        ["Ethiopia", "Kenya", "Ghana", "Nigeria"],
        0,
      ),
      single(
        "At the Battle of Adwa in 1896, Ethiopia defeated which European power?",
        ["Britain", "France", "Italy", "Germany"],
        2,
      ),
      multiple(
        "Which of these were colonial powers in Africa?",
        ["Belgium", "Portugal", "Japan", "Brazil"],
        [0, 1],
      ),
      trueFalse(
        "King Leopold II ruled the Congo Free State as his personal possession.",
        true,
      ),
    ],
  },
  {
    title: "JavaScript gotchas",
    description: "Hoisting, coercion and closures. Can you predict the output?",
    category: "technology",
    difficulty: "INTERMEDIATE",
    minutes: 10,
    author: "Kevin N.",
    daysAgo: 2,
    questions: [
      single(
        "What does typeof null return?",
        ["null", "object", "undefined", "number"],
        1,
      ),
      trueFalse(
        "In JavaScript, 0.1 + 0.2 === 0.3 is true.",
        false,
        "Floating point rounding makes the sum slightly larger than 0.3.",
      ),
      single(
        "What does [] + [] evaluate to?",
        ["An empty string", "0", "An empty array", "NaN"],
        0,
      ),
      multiple(
        "Which of these values are falsy?",
        ["0", "An empty string", 'The string "0"', "An empty array"],
        [0, 1],
      ),
      trueFalse("let is block scoped, while var is function scoped.", true),
    ],
  },
  {
    title: "Name that chord",
    description: "Major, minor, seventh. Test your ear and your theory.",
    category: "music",
    difficulty: "BEGINNER",
    minutes: 5,
    author: "Zawadi K.",
    daysAgo: 12,
    questions: [
      single("How many notes are in a triad?", ["2", "3", "4", "5"], 1),
      single(
        "Which interval sits above the root in a major chord?",
        ["Minor third", "Major third", "Perfect fourth", "Diminished fifth"],
        1,
      ),
      single(
        "Which notes make up a C major chord?",
        ["C, E, G", "C, Eb, G", "C, F, A", "C, D, G"],
        0,
      ),
      trueFalse("A minor chord sounds brighter than a major chord.", false),
      single(
        "How many strings does a standard guitar have?",
        ["4", "5", "6", "7"],
        2,
      ),
    ],
  },
  {
    title: "World Cup trivia",
    description: "Finals, upsets and golden boots from every tournament.",
    category: "sports",
    difficulty: "BEGINNER",
    minutes: 8,
    author: "Otieno J.",
    daysAgo: 1,
    questions: [
      single(
        "Who won the 2018 men's World Cup?",
        ["Croatia", "France", "Brazil", "Germany"],
        1,
      ),
      single(
        "Which country has won the most men's World Cups?",
        ["Germany", "Italy", "Argentina", "Brazil"],
        3,
      ),
      single(
        "Which country hosted the 2022 World Cup?",
        ["Qatar", "Russia", "Brazil", "Japan"],
        0,
      ),
      trueFalse("Argentina won the 2022 World Cup.", true),
      multiple(
        "Which of these countries have won the men's World Cup?",
        ["Germany", "Spain", "Netherlands", "Italy"],
        [0, 1, 3],
        "The Netherlands have reached three finals without winning.",
      ),
    ],
  },
  {
    title: "Oscar-winning films",
    description: "Best picture winners and the stories behind them.",
    category: "movies",
    difficulty: "INTERMEDIATE",
    minutes: 12,
    author: "Lucy A.",
    daysAgo: 6,
    questions: [
      multiple(
        "Which films won 11 Academy Awards?",
        [
          "Ben-Hur",
          "Titanic",
          "The Lord of the Rings: The Return of the King",
          "Gladiator",
        ],
        [0, 1, 2],
      ),
      trueFalse(
        "Parasite was the first non-English language film to win best picture.",
        true,
      ),
      single(
        "Who directed Parasite?",
        ["Park Chan-wook", "Bong Joon-ho", "Hirokazu Kore-eda", "Ang Lee"],
        1,
      ),
      single(
        "Which film won best picture at the 2023 ceremony?",
        [
          "Oppenheimer",
          "Everything Everywhere All at Once",
          "Top Gun: Maverick",
          "The Fabelmans",
        ],
        1,
      ),
      single(
        "Who directed Oppenheimer?",
        [
          "Denis Villeneuve",
          "Martin Scorsese",
          "Christopher Nolan",
          "Greta Gerwig",
        ],
        2,
      ),
    ],
  },
  {
    title: "Street food around the world",
    description:
      "Where does this dish come from? Eat your way through 12 countries.",
    category: "food",
    difficulty: "BEGINNER",
    minutes: null,
    author: "Faith M.",
    daysAgo: 4,
    questions: [
      single(
        "Which country is tacos al pastor from?",
        ["Spain", "Mexico", "Peru", "Colombia"],
        1,
      ),
      single(
        "Pad thai comes from which country?",
        ["Vietnam", "Laos", "Thailand", "Cambodia"],
        2,
      ),
      single(
        "Where does the banh mi sandwich come from?",
        ["Vietnam", "China", "Japan", "Korea"],
        0,
      ),
      trueFalse(
        "Falafel is typically made from chickpeas or fava beans.",
        true,
      ),
      single(
        "What does nyama choma mean in Swahili?",
        ["Fried fish", "Grilled meat", "Boiled maize", "Spiced tea"],
        1,
      ),
    ],
  },
];

// A small seeded generator keeps the demo data the same on every run
function createRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = createRandom(2026);

function between(min: number, max: number) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function shuffled<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = between(0, i);
    const a = copy[i];
    const b = copy[j];
    if (a === undefined || b === undefined) continue;
    copy[i] = b;
    copy[j] = a;
  }
  return copy;
}

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function clearDemoData() {
  const demoUsers = await db
    .select({ id: users.id })
    .from(users)
    .where(like(users.email, `%${DEMO_DOMAIN}`));
  const ids = demoUsers.map((row) => row.id);
  if (ids.length === 0) return;

  // Quizzes keep a null author when a user goes, so remove them first
  await db.delete(quizzes).where(inArray(quizzes.userId, ids));
  await db.delete(users).where(inArray(users.id, ids));
}

type SeededQuestion = {
  id: number;
  type: QuestionType;
  options: { id: number; isCorrect: boolean }[];
};

async function createQuiz(seed: QuizSeed, categoryId: number, userId: number) {
  const publishedAt = new Date(Date.now() - seed.daysAgo * DAY);

  const [quiz] = await db
    .insert(quizzes)
    .values({
      userId,
      categoryId,
      slug: slugify(seed.title),
      title: seed.title,
      description: seed.description,
      difficulty: seed.difficulty,
      status: "PUBLISHED",
      timeLimitSeconds: seed.minutes ? seed.minutes * 60 : null,
      publishedAt,
      createdAt: new Date(publishedAt.getTime() - DAY),
    })
    .returning({ id: quizzes.id });

  if (!quiz) throw new Error(`Could not create "${seed.title}"`);

  const questionRows = await db
    .insert(questions)
    .values(
      seed.questions.map(([title, type, , , explanation], position) => ({
        quizId: quiz.id,
        type,
        title,
        explanation: explanation ?? null,
        position,
      })),
    )
    .returning({ id: questions.id, position: questions.position });

  const questionIdByPosition = new Map(
    questionRows.map((row) => [row.position, row.id]),
  );

  const optionRows = await db
    .insert(questionOptions)
    .values(
      seed.questions.flatMap(([, , options, correct], questionPosition) => {
        const questionId = questionIdByPosition.get(questionPosition);
        if (!questionId) throw new Error("Missing question id");
        return options.map((label, position) => ({
          questionId,
          label,
          isCorrect: correct.includes(position),
          position,
        }));
      }),
    )
    .returning({
      id: questionOptions.id,
      questionId: questionOptions.questionId,
      isCorrect: questionOptions.isCorrect,
    });

  const seeded: SeededQuestion[] = seed.questions.map(
    ([, type], questionPosition) => {
      const questionId = questionIdByPosition.get(questionPosition) ?? 0;
      return {
        id: questionId,
        type,
        options: optionRows.filter(
          (option) => option.questionId === questionId,
        ),
      };
    },
  );

  return { id: quiz.id, questions: seeded };
}

async function simulatePlays(
  seed: QuizSeed,
  quiz: { id: number; questions: SeededQuestion[] },
  players: { id: number; skill: number }[],
) {
  const level = difficultyInfo[seed.difficulty].level;
  const limit = seed.minutes ? seed.minutes * 60 : null;
  const adjustment =
    seed.difficulty === "BEGINNER"
      ? 0.1
      : seed.difficulty === "ADVANCED"
        ? -0.12
        : 0;
  const ratings: { quizId: number; userId: number; rating: number }[] = [];

  for (const player of players) {
    if (random() > 0.75) continue;

    const chance = Math.min(0.97, Math.max(0.2, player.skill + adjustment));

    const answers = quiz.questions.map((question) => {
      const correctIds = question.options
        .filter((option) => option.isCorrect)
        .map((option) => option.id);
      const isCorrect = random() < chance;

      let selectedOptionIds = correctIds;
      if (!isCorrect) {
        if (question.type === "MULTIPLE") {
          selectedOptionIds = correctIds.slice(0, 1);
        } else {
          const wrong = question.options.filter((option) => !option.isCorrect);
          const pick = wrong[between(0, wrong.length - 1)];
          selectedOptionIds = pick ? [pick.id] : [];
        }
      }

      return {
        questionId: question.id,
        selectedOptionIds,
        isCorrect,
        timeSpentMs: between(2500, 14000),
      };
    });

    const score = answers.filter((answer) => answer.isCorrect).length;
    const total = answers.length;
    const base = score * 10 * level;
    const perfect = score === total ? Math.round(base * 0.2) : 0;
    const timeTaken = limit
      ? between(Math.round(limit * 0.25), Math.round(limit * 0.95))
      : between(60, 420);
    const completedAt = new Date(Date.now() - between(1, 14 * 24) * HOUR);

    const [attempt] = await db
      .insert(quizAttempts)
      .values({
        quizId: quiz.id,
        userId: player.id,
        status: "COMPLETED",
        score,
        percentage: Math.round((score / total) * 100),
        timeTaken,
        xpEarned: base + perfect,
        startedAt: new Date(completedAt.getTime() - timeTaken * 1000),
        completedAt,
      })
      .returning({ id: quizAttempts.id });

    if (!attempt) continue;

    await db
      .insert(attemptAnswers)
      .values(answers.map((answer) => ({ attemptId: attempt.id, ...answer })));

    if (random() < 0.6) {
      const rating = Math.round(3 + player.skill * 2 + (random() - 0.5));
      ratings.push({
        quizId: quiz.id,
        userId: player.id,
        rating: Math.min(5, Math.max(3, rating)),
      });
    }
  }

  if (ratings.length > 0) await db.insert(quizRatings).values(ratings);
  return ratings.length;
}

async function main() {
  await clearDemoData();

  const categoryRows = await db
    .select({ id: categories.id, slug: categories.slug })
    .from(categories);
  const categoryIds = new Map(categoryRows.map((row) => [row.slug, row.id]));
  if (categoryIds.size === 0) {
    throw new Error("No categories found. Run pnpm db:seed first.");
  }

  const authorRows = await db
    .insert(users)
    .values(
      authorNames.map((name, index) => ({
        name,
        email: `author-${index + 1}${DEMO_DOMAIN}`,
        emailVerified: true,
        role: "CREATOR" as const,
        timezone: "Africa/Nairobi",
      })),
    )
    .returning({ id: users.id, name: users.name });
  const authorIds = new Map(authorRows.map((row) => [row.name, row.id]));

  const playerRows = await db
    .insert(users)
    .values(
      playerNames.map((name, index) => ({
        name,
        email: `player-${index + 1}${DEMO_DOMAIN}`,
        emailVerified: true,
        role: "USER" as const,
        timezone: "Africa/Nairobi",
      })),
    )
    .returning({ id: users.id });
  const players = playerRows.map((row, index) => ({
    id: row.id,
    skill: 0.45 + (index / Math.max(playerRows.length - 1, 1)) * 0.5,
  }));

  const quizIds: number[] = [];
  let ratingCount = 0;

  for (const seed of quizSeeds) {
    const categoryId = categoryIds.get(seed.category);
    const userId = authorIds.get(seed.author);
    if (!categoryId || !userId) {
      throw new Error(`Bad category or author for "${seed.title}"`);
    }

    const quiz = await createQuiz(seed, categoryId, userId);
    quizIds.push(quiz.id);
    ratingCount += await simulatePlays(seed, quiz, players);
  }

  const bookmarks = players.flatMap((player) =>
    shuffled(quizIds)
      .slice(0, 2)
      .map((quizId) => ({ quizId, userId: player.id })),
  );
  await db.insert(quizBookmarks).values(bookmarks);

  const [attemptTotals] = await db
    .select({ id: quizAttempts.id })
    .from(quizAttempts)
    .where(inArray(quizAttempts.quizId, quizIds))
    .limit(1);

  console.log(
    `Demo data ready: ${quizIds.length} quizzes, ${authorRows.length} creators, ${players.length} players, ${ratingCount} ratings${attemptTotals ? "" : ", no attempts"}`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => client.end());
