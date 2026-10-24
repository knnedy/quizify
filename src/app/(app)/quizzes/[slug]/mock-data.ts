import type { QuizCardData } from "@/components/quiz-card";
import { difficultyInfo } from "@/lib/difficulty";
import { listQuizzes } from "../mock-data";

export type Viewer = "guest" | "new" | "returning";

export type LeaderboardEntry = {
  rank: number;
  name: string;
  score: number;
  timeSeconds: number;
  isYou: boolean;
};

export type RatingBucket = { stars: number; count: number };

export type BestResult = {
  score: number;
  total: number;
  percentage: number;
  timeSeconds: number;
  rank: number;
  xpEarned: number;
  attempts: number;
  lastPlayedAt: string;
};

export type QuizDetail = QuizCardData & {
  tags: string[];
  publishedAt: string;
  xpReward: number;
  distribution: RatingBucket[];
  leaderboard: {
    top: LeaderboardEntry[];
    pinned: LeaderboardEntry | null;
  };
  best: BestResult | null;
  related: QuizCardData[];
};

const DAY = 86_400_000;
const BASE = Date.parse("2026-10-20");

const viewers: readonly Viewer[] = ["guest", "new", "returning"];

function isViewer(value: string | undefined): value is Viewer {
  return viewers.some((viewer) => viewer === value);
}

// Dev only: ?as=guest | new | returning forces a state. Otherwise the real
// session decides, and a signed in user sees the returning player state.
export function resolveViewer(override: string | undefined, signedIn: boolean) {
  if (process.env.NODE_ENV !== "production" && isViewer(override)) {
    return override;
  }
  return signedIn ? "returning" : "guest";
}

const names = [
  "Amina W.",
  "Brian O.",
  "Wanjiku M.",
  "Kevin N.",
  "Zawadi K.",
  "Otieno J.",
  "Lucy A.",
  "Faith M.",
  "Hassan D.",
  "Dr. Njeri",
  "Peter K.",
  "Mercy A.",
  "Daniel S.",
  "Grace L.",
];

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

function hash(value: string) {
  let result = 0;
  for (const char of value) {
    result = (result * 31 + char.charCodeAt(0)) >>> 0;
  }
  return result;
}

function buildDistribution(
  average: number | null,
  count: number,
): RatingBucket[] {
  const stars = [5, 4, 3, 2, 1];

  if (average === null || count === 0) {
    return stars.map((value) => ({ stars: value, count: 0 }));
  }

  const weights = stars.map((value) =>
    Math.exp(-((value - average) ** 2) / 0.5),
  );
  const sum = weights.reduce((a, b) => a + b, 0);
  const counts = weights.map((weight) => Math.floor((weight / sum) * count));
  const peak = weights.indexOf(Math.max(...weights));
  counts[peak] += count - counts.reduce((a, b) => a + b, 0);

  return stars.map((value, index) => ({ stars: value, count: counts[index] }));
}

export async function getQuizDetail(
  slug: string,
  viewer: Viewer,
): Promise<QuizDetail | null> {
  const { items } = await listQuizzes({ pageSize: 100 });
  const quiz = items.find((item) => item.slug === slug);
  if (!quiz) return null;

  const { items: related } = await listQuizzes({
    category: quiz.category.slug,
    exclude: slug,
    sort: "popular",
    pageSize: 3,
  });

  const h = hash(slug);
  const total = quiz.questions;
  const xpReward = total * 10 * difficultyInfo[quiz.difficulty].level;
  const fastest = quiz.timeLimitMinutes
    ? quiz.timeLimitMinutes * 18
    : total * 12;

  // An even question count puts the viewer third in the list, an odd one
  // pins their row below it, so both layouts can be checked.
  const youInTop = viewer === "returning" && total % 2 === 0;

  const top = [0, 11, 24, 6, 19].map((offset, index): LeaderboardEntry => {
    const entry = {
      rank: index + 1,
      name: names[(h + index * 3) % names.length],
      score: index < 3 ? total : total - 1,
      timeSeconds: fastest + offset,
      isYou: false,
    };
    return youInTop && index === 2
      ? { ...entry, name: "You", isYou: true }
      : entry;
  });

  const pinned: LeaderboardEntry | null =
    viewer === "returning" && !youInTop
      ? {
          rank: 14 + (h % 30),
          name: "You",
          score: Math.max(1, total - 3),
          timeSeconds: fastest + 55,
          isYou: true,
        }
      : null;

  const you = top.find((entry) => entry.isYou) ?? pinned;

  const best: BestResult | null = you
    ? {
        score: you.score,
        total,
        percentage: Math.round((you.score / total) * 100),
        timeSeconds: you.timeSeconds,
        rank: you.rank,
        xpEarned: Math.round((xpReward * you.score) / total),
        attempts: 1 + (h % 4),
        lastPlayedAt: new Date(BASE - (1 + (h % 9)) * DAY).toISOString(),
      }
    : null;

  const pool = tagPool[quiz.category.slug] ?? [];

  return {
    ...quiz,
    tags: [0, 1, 2].map((i) => pool[(h + i) % pool.length]).filter(Boolean),
    publishedAt: new Date(BASE - (14 + (h % 90)) * DAY).toISOString(),
    xpReward,
    distribution: buildDistribution(quiz.avgRating, quiz.ratings),
    leaderboard: { top, pinned },
    best,
    related,
  };
}
