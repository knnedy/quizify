import { getMyQuizzesView } from "@/app/(app)/my-quizzes/mock-data";
import { listQuizzes } from "@/app/(app)/quizzes/mock-data";
import type { QuizCardData } from "@/components/quiz-card";
import { difficultyInfo } from "@/lib/difficulty";

export type DashboardView = "playing" | "creating";
export type Preview = "creator" | "player" | "new";

export type StreakDay = { label: string; played: boolean; today: boolean };

export type Streak = {
  current: number;
  best: number;
  playedToday: boolean;
  days: StreakDay[];
};

export type PlayerStats = {
  completed: number;
  thisWeek: number;
  averagePercentage: number | null;
  totalXp: number;
  perfectScores: number;
};

export type InProgress = {
  slug: string;
  title: string;
  answered: number;
  total: number;
  secondsLeft: number | null;
};

export type RecentResult = {
  slug: string;
  title: string;
  category: { name: string; slug: string };
  score: number;
  total: number;
  percentage: number;
  daysAgo: number;
  xp: number;
};

export type TopicScore = {
  slug: string;
  name: string;
  plays: number;
  averagePercentage: number;
};

export type AchievementIcon =
  | "star"
  | "target"
  | "trophy"
  | "flame"
  | "sparkles"
  | "zap"
  | "pen";

export type Achievement = {
  key: string;
  title: string;
  description: string;
  icon: AchievementIcon;
  progress: number;
  threshold: number;
  xpReward: number;
  completed: boolean;
};

export type Picks = {
  title: string;
  text: string;
  quizzes: QuizCardData[];
};

export type Eligibility = { completed: number; required: number };

export type AttentionItem = { slug: string; title: string; reason: string };

export type CreatorQuiz = {
  slug: string;
  title: string;
  category: { name: string; slug: string };
  plays: number;
  plays30: number;
  avgRating: number | null;
  ratings: number;
  finishRate: number;
  questions: number;
};

export type DraftQuiz = {
  slug: string;
  title: string;
  questions: number;
  note: string;
};

export type CreatorActivityKind = "play" | "rating" | "milestone";

export type CreatorActivity = {
  id: number;
  kind: CreatorActivityKind;
  actor: string;
  text: string;
  slug: string;
  minutesAgo: number;
};

export type CreatorOverview = {
  published: number;
  plays30: number;
  plays30Delta: number;
  players30: number;
  avgRating: number | null;
  ratings: number;
  series: { date: string; plays: number }[];
  quizzes: CreatorQuiz[];
  drafts: DraftQuiz[];
  attention: AttentionItem[];
  activity: CreatorActivity[];
};

export type Dashboard = {
  firstName: string;
  isNew: boolean;
  isCreator: boolean;
  totalXp: number;
  streak: Streak;
  stats: PlayerStats;
  inProgress: InProgress | null;
  suggestion: QuizCardData | null;
  recent: RecentResult[];
  topics: TopicScore[];
  achievements: Achievement[];
  saved: QuizCardData[];
  picks: Picks;
  eligibility: Eligibility;
  creator: CreatorOverview | null;
};

type Profile = {
  name: string;
  completed: number;
  thisWeek: number;
  average: number | null;
  xp: number;
  perfect: number;
  streak: number;
  best: number;
  playedToday: boolean;
  creator: boolean;
  resume: boolean;
  saved: number;
};

type Totals = {
  completed: number;
  best: number;
  perfect: number;
  xp: number;
  created: number;
};

type Definition = {
  key: string;
  title: string;
  description: string;
  icon: AchievementIcon;
  threshold: number;
  xpReward: number;
  creatorOnly?: boolean;
  value: (totals: Totals) => number;
};

const DAY = 86_400_000;
const BASE = Date.parse("2026-10-20");
const REQUIRED_QUIZZES = 3;
const RESUME_SLUG = "capital-cities-of-africa";

const previews: readonly Preview[] = ["creator", "player", "new"];

// Dev only: ?as=creator | player | new forces an account state.
export function parsePreview(value: string | undefined): Preview | null {
  if (process.env.NODE_ENV === "production") return null;
  return previews.find((preview) => preview === value) ?? null;
}

const profiles: Record<Preview, Profile> = {
  creator: {
    name: "Amina Wanjiru",
    completed: 34,
    thisWeek: 5,
    average: 81,
    xp: 4820,
    perfect: 7,
    streak: 6,
    best: 11,
    playedToday: true,
    creator: true,
    resume: true,
    saved: 4,
  },
  player: {
    name: "Kevin Njoroge",
    completed: 9,
    thisWeek: 2,
    average: 74,
    xp: 1420,
    perfect: 1,
    streak: 3,
    best: 5,
    playedToday: false,
    creator: false,
    resume: false,
    saved: 2,
  },
  new: {
    name: "Faith Mutua",
    completed: 0,
    thisWeek: 0,
    average: null,
    xp: 0,
    perfect: 0,
    streak: 0,
    best: 0,
    playedToday: false,
    creator: false,
    resume: false,
    saved: 0,
  },
};

const weekday = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  timeZone: "UTC",
});

// Sunday first, to match Date.getUTCDay.
const weekdayWeights = [1.25, 0.9, 0.85, 0.9, 0.95, 1.05, 1.3];

const recentRows: [
  slug: string,
  creatorScore: number,
  playerScore: number,
  daysAgo: number,
][] = [
  ["world-cup-trivia", 14, 11, 0],
  ["solar-system-essentials", 9, 7, 1],
  ["kenyan-geography", 15, 12, 2],
  ["javascript-gotchas", 12, 9, 4],
  ["flags-of-the-world", 24, 20, 6],
];

const topicNames: Record<string, string> = {
  geography: "Geography",
  science: "Science",
  history: "History",
  technology: "Technology",
  sports: "Sports",
};

const topicData: Record<
  Preview,
  [slug: string, plays: number, average: number][]
> = {
  creator: [
    ["geography", 11, 86],
    ["science", 8, 90],
    ["technology", 6, 73],
    ["sports", 5, 84],
    ["history", 4, 64],
  ],
  player: [
    ["geography", 3, 80],
    ["science", 2, 85],
    ["sports", 2, 70],
    ["technology", 1, 60],
    ["history", 1, 55],
  ],
  new: [],
};

const definitions: Definition[] = [
  {
    key: "first-steps",
    title: "First steps",
    description: "Finish your first quiz",
    icon: "star",
    threshold: 1,
    xpReward: 20,
    value: (totals) => totals.completed,
  },
  {
    key: "getting-warm",
    title: "Getting warm",
    description: "Finish 10 quizzes",
    icon: "target",
    threshold: 10,
    xpReward: 50,
    value: (totals) => totals.completed,
  },
  {
    key: "marathon",
    title: "Quiz marathon",
    description: "Finish 50 quizzes",
    icon: "trophy",
    threshold: 50,
    xpReward: 200,
    value: (totals) => totals.completed,
  },
  {
    key: "week-on-fire",
    title: "Week on fire",
    description: "Play 7 days in a row",
    icon: "flame",
    threshold: 7,
    xpReward: 100,
    value: (totals) => totals.best,
  },
  {
    key: "sharpshooter",
    title: "Sharpshooter",
    description: "Get 10 perfect scores",
    icon: "sparkles",
    threshold: 10,
    xpReward: 150,
    value: (totals) => totals.perfect,
  },
  {
    key: "xp-hunter",
    title: "XP hunter",
    description: "Earn 5,000 XP",
    icon: "zap",
    threshold: 5000,
    xpReward: 250,
    value: (totals) => totals.xp,
  },
  {
    key: "author",
    title: "Author",
    description: "Publish 5 quizzes",
    icon: "pen",
    threshold: 5,
    xpReward: 150,
    creatorOnly: true,
    value: (totals) => totals.created,
  },
];

function hash(value: string) {
  let result = 0;
  for (const char of value) {
    result = (result * 31 + char.charCodeAt(0)) >>> 0;
  }
  return result;
}

function noise(index: number, salt: string) {
  return (hash(`${salt}:${index}`) % 1000) / 1000;
}

// The last seven days, ending today. The streak counts back from today if you
// played today, or from yesterday if you haven't yet.
function buildStreak(profile: Profile): Streak {
  const last = profile.playedToday ? 6 : 5;

  return {
    current: profile.streak,
    best: profile.best,
    playedToday: profile.playedToday,
    days: Array.from({ length: 7 }, (_, index) => ({
      label: weekday.format(new Date(BASE - (6 - index) * DAY)),
      played:
        profile.streak > 0 && index <= last && index > last - profile.streak,
      today: index === 6,
    })),
  };
}

function draftNote(questions: number) {
  if (questions === 0) return "No questions yet";
  if (questions < 5) return "Needs at least 5 questions to publish";
  return "1 question needs finishing";
}

function buildSeries(plays30: number) {
  const average = plays30 / 30;

  return Array.from({ length: 14 }, (_, index) => {
    const date = new Date(BASE - (13 - index) * DAY);
    const weight = weekdayWeights[date.getUTCDay()];
    const growth = 0.9 + 0.2 * (index / 13);

    return {
      date: date.toISOString(),
      plays: Math.max(
        0,
        Math.round(
          average * weight * growth * (0.75 + 0.5 * noise(index, "series")),
        ),
      ),
    };
  });
}

function buildActivity(rows: CreatorQuiz[]): CreatorActivity[] {
  if (rows.length === 0) return [];

  const at = (index: number) => rows[index % rows.length];
  const top = at(0);

  return [
    {
      id: 1,
      kind: "play",
      actor: "Brian O.",
      text: `scored ${top.questions - 1}/${top.questions} on ${top.title}`,
      slug: top.slug,
      minutesAgo: 18,
    },
    {
      id: 2,
      kind: "rating",
      actor: "Lucy A.",
      text: `gave ${at(1).title} 5 stars`,
      slug: at(1).slug,
      minutesAgo: 95,
    },
    {
      id: 3,
      kind: "play",
      actor: "Zawadi K.",
      text: `finished ${at(2).title}`,
      slug: at(2).slug,
      minutesAgo: 240,
    },
    {
      id: 4,
      kind: "milestone",
      actor: top.title,
      text: `passed ${(Math.floor(top.plays / 100) * 100).toLocaleString("en-US")} plays`,
      slug: top.slug,
      minutesAgo: 610,
    },
    {
      id: 5,
      kind: "rating",
      actor: "Hassan D.",
      text: `rated ${at(3).title} 4 stars`,
      slug: at(3).slug,
      minutesAgo: 1380,
    },
    {
      id: 6,
      kind: "play",
      actor: "Faith M.",
      text: `scored ${at(4).questions - 3}/${at(4).questions} on ${at(4).title}`,
      slug: at(4).slug,
      minutesAgo: 2900,
    },
  ];
}

async function buildCreator(): Promise<CreatorOverview> {
  const view = await getMyQuizzesView({ preview: "creator" });
  const quizzes = view.state === "creator" ? view.quizzes : [];

  const published = quizzes
    .filter((quiz) => quiz.status === "PUBLISHED")
    .sort((a, b) => b.plays - a.plays);

  const totalPlays = published.reduce((sum, quiz) => sum + quiz.plays, 0);
  const plays30 = Math.round(totalPlays * 0.14);
  const ratings = published.reduce((sum, quiz) => sum + quiz.ratings, 0);
  const weighted = published.reduce(
    (sum, quiz) => sum + (quiz.avgRating ?? 0) * quiz.ratings,
    0,
  );

  const rows = published.map(
    (quiz): CreatorQuiz => ({
      slug: quiz.slug,
      title: quiz.title,
      category: quiz.category,
      plays: quiz.plays,
      plays30: Math.round(
        quiz.plays * 0.14 * (0.7 + 0.6 * noise(0, quiz.slug)),
      ),
      avgRating: quiz.avgRating,
      ratings: quiz.ratings,
      finishRate: 62 + (hash(quiz.slug) % 33),
      questions: quiz.questions,
    }),
  );

  return {
    published: published.length,
    plays30,
    plays30Delta: 18,
    players30: Math.round(plays30 * 0.62),
    avgRating: ratings > 0 ? weighted / ratings : null,
    ratings,
    series: buildSeries(plays30),
    quizzes: rows,
    drafts: quizzes
      .filter((quiz) => quiz.status === "DRAFT")
      .map(
        (quiz): DraftQuiz => ({
          slug: quiz.slug,
          title: quiz.title,
          questions: quiz.questions,
          note: draftNote(quiz.questions),
        }),
      ),
    attention: quizzes
      .filter((quiz) => quiz.status === "SUSPENDED")
      .map(
        (quiz): AttentionItem => ({
          slug: quiz.slug,
          title: quiz.title,
          reason: quiz.suspensionReason ?? "An admin has hidden this quiz.",
        }),
      ),
    activity: buildActivity(rows),
  };
}

// Stand-in for the real dashboard queries. Each section is one query there.
export async function getDashboard(preview: Preview): Promise<Dashboard> {
  const profile = profiles[preview];

  const [catalog, popular, beginner, creator] = await Promise.all([
    listQuizzes({ pageSize: 100 }),
    listQuizzes({ sort: "popular", pageSize: 12 }),
    listQuizzes({ difficulty: "BEGINNER", sort: "popular", pageSize: 6 }),
    profile.creator ? buildCreator() : Promise.resolve(null),
  ]);

  const rows = preview === "new" ? [] : recentRows;
  const recent = rows.flatMap(
    ([slug, creatorScore, playerScore, daysAgo]): RecentResult[] => {
      const quiz = catalog.items.find((item) => item.slug === slug);
      if (!quiz) return [];

      const score = Math.min(
        quiz.questions,
        preview === "creator" ? creatorScore : playerScore,
      );

      return [
        {
          slug,
          title: quiz.title,
          category: quiz.category,
          score,
          total: quiz.questions,
          percentage: Math.round((score / quiz.questions) * 100),
          daysAgo,
          xp: score * 10 * difficultyInfo[quiz.difficulty].level,
        },
      ];
    },
  );

  const resumeQuiz = profile.resume
    ? catalog.items.find((item) => item.slug === RESUME_SLUG)
    : undefined;

  const inProgress: InProgress | null = resumeQuiz
    ? {
        slug: resumeQuiz.slug,
        title: resumeQuiz.title,
        answered: Math.round(resumeQuiz.questions * 0.6),
        total: resumeQuiz.questions,
        secondsLeft: resumeQuiz.timeLimitMinutes ? 148 : null,
      }
    : null;

  const seen = new Set([...recent.map((result) => result.slug), RESUME_SLUG]);
  const pool = preview === "new" ? beginner.items : popular.items;
  const candidates = pool.filter((quiz) => !seen.has(quiz.slug)).slice(0, 4);
  const [suggestion = null, ...rest] = candidates;

  const created = creator ? creator.published : 0;
  const totals: Totals = {
    completed: profile.completed,
    best: profile.best,
    perfect: profile.perfect,
    xp: profile.xp,
    created,
  };

  const achievements = definitions
    .filter((definition) => !definition.creatorOnly || profile.creator)
    .map((definition): Achievement => {
      const value = definition.value(totals);

      return {
        key: definition.key,
        title: definition.title,
        description: definition.description,
        icon: definition.icon,
        progress: Math.min(value, definition.threshold),
        threshold: definition.threshold,
        xpReward: definition.xpReward,
        completed: value >= definition.threshold,
      };
    });

  return {
    firstName: profile.name.split(" ")[0],
    isNew: preview === "new",
    isCreator: profile.creator,
    totalXp: profile.xp,
    streak: buildStreak(profile),
    stats: {
      completed: profile.completed,
      thisWeek: profile.thisWeek,
      averagePercentage: profile.average,
      totalXp: profile.xp,
      perfectScores: profile.perfect,
    },
    inProgress,
    suggestion,
    recent,
    topics: topicData[preview].map(([slug, plays, average]) => ({
      slug,
      name: topicNames[slug] ?? slug,
      plays,
      averagePercentage: average,
    })),
    achievements,
    saved: catalog.items
      .filter((quiz) => quiz.isBookmarked)
      .slice(0, profile.saved),
    picks:
      preview === "new"
        ? {
            title: "Good first quizzes",
            text: "Beginner friendly and popular with new players.",
            quizzes: rest.slice(0, 3),
          }
        : {
            title: "Picked for you",
            text: "Based on the topics you play most.",
            quizzes: rest.slice(0, 3),
          },
    eligibility: { completed: profile.completed, required: REQUIRED_QUIZZES },
    creator,
  };
}
