import type { QuizCardData } from "@/components/quiz-card";
import { difficultyInfo } from "@/lib/difficulty";
import { listQuizzes } from "../../mock-data";

export type ResultStatus = "COMPLETED" | "TIMED_OUT";

export type XpLine = {
  label: string;
  detail?: string;
  amount: number;
};

export type QuizResult = {
  slug: string;
  title: string;
  status: ResultStatus;
  score: number;
  total: number;
  answered: number;
  percentage: number;
  timeSeconds: number;
  timeLimitSeconds: number | null;
  rank: number;
  players: number;
  previousBest: number | null;
  isNewBest: boolean;
  xpLines: XpLine[];
  xpTotal: number;
  myRating: number | null;
  category: { name: string; slug: string };
  related: QuizCardData[];
};

function hash(value: string) {
  let result = 0;
  for (const char of value) {
    result = (result * 31 + char.charCodeAt(0)) >>> 0;
  }
  return result;
}

// Dev only: ?score=7 forces the score, ?timeout=1 forces a timed out attempt
// (timed quizzes only), so every verdict and badge can be checked.
export async function getQuizResult(
  slug: string,
  options: { score?: number; timedOut?: boolean } = {},
): Promise<QuizResult | null> {
  const { items } = await listQuizzes({ pageSize: 100 });
  const quiz = items.find((item) => item.slug === slug);
  if (!quiz) return null;

  const dev = process.env.NODE_ENV !== "production";
  const h = hash(slug);
  const total = quiz.questions;
  const timeLimitSeconds = quiz.timeLimitMinutes
    ? quiz.timeLimitMinutes * 60
    : null;

  const timedOut =
    dev && options.timedOut === true && timeLimitSeconds !== null;
  const answered = timedOut ? Math.max(1, Math.round(total * 0.7)) : total;

  const defaultScore = Math.max(0, total - (h % 6));
  const requested =
    dev && options.score !== undefined ? options.score : defaultScore;
  const score = Math.min(Math.max(requested, 0), answered);
  const percentage = Math.round((score / total) * 100);

  const timeSeconds =
    timeLimitSeconds !== null
      ? timedOut
        ? timeLimitSeconds
        : Math.round(timeLimitSeconds * (0.4 + (h % 45) / 100))
      : total * 14 + (h % 50);

  const rank =
    score === total ? 1 + (h % 3) : 4 + (total - score) * 5 + (h % 5);
  const players = Math.max(quiz.plays, rank + 20);

  const previousBest =
    h % 3 === 0 ? null : Math.min(total, Math.max(0, score - 2 + (h % 5)));
  const isNewBest = previousBest !== null && score > previousBest;

  const perQuestion = 10 * difficultyInfo[quiz.difficulty].level;
  const xpLines: XpLine[] = [
    {
      label: "Correct answers",
      detail: `${score} × ${perQuestion} XP`,
      amount: score * perQuestion,
    },
  ];
  if (score === total) {
    xpLines.push({
      label: "Perfect score bonus",
      amount: Math.round(total * perQuestion * 0.2),
    });
  }
  if (h % 2 === 0 && score > 0) {
    const days = 2 + (h % 6);
    xpLines.push({ label: `${days}-day streak bonus`, amount: 5 * days });
  }

  const { items: related } = await listQuizzes({
    category: quiz.category.slug,
    exclude: slug,
    sort: "popular",
    pageSize: 3,
  });

  return {
    slug: quiz.slug,
    title: quiz.title,
    status: timedOut ? "TIMED_OUT" : "COMPLETED",
    score,
    total,
    answered,
    percentage,
    timeSeconds,
    timeLimitSeconds,
    rank,
    players,
    previousBest,
    isNewBest,
    xpLines,
    xpTotal: xpLines.reduce((sum, line) => sum + line.amount, 0),
    myRating: h % 4 === 0 ? 4 : null,
    category: quiz.category,
    related,
  };
}
