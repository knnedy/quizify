import type { ReportReason } from "@/lib/report-reasons";

export type ReportStatus = "OPEN" | "DISMISSED" | "SUSPENDED" | "DELETED";

export type Report = {
  id: number;
  reporter: { name: string; completed: number };
  reason: ReportReason;
  details: string | null;
  daysAgo: number;
};

export type ReportedQuiz = {
  id: number;
  status: ReportStatus;
  hiddenAutomatically: boolean;
  quiz: {
    slug: string;
    title: string;
    category: { name: string; slug: string };
    questions: number;
    plays: number;
    avgRating: number | null;
    publishedDaysAgo: number;
  };
  creator: {
    id: number;
    name: string;
    former: boolean;
    published: number;
    strikes: number;
  };
  reports: Report[];
  decision: { by: string; at: string; note: string | null } | null;
};

const DAY = 86_400_000;
const BASE = Date.parse("2026-10-20");

function iso(daysAgo: number) {
  return new Date(BASE - daysAgo * DAY).toISOString();
}

let nextReportId = 1;

function report(
  name: string,
  completed: number,
  reason: ReportReason,
  daysAgo: number,
  details: string | null = null,
): Report {
  return {
    id: nextReportId++,
    reporter: { name, completed },
    reason,
    details,
    daysAgo,
  };
}

const items: ReportedQuiz[] = [
  {
    id: 1,
    status: "OPEN",
    hiddenAutomatically: true,
    quiz: {
      slug: "benga-and-beyond",
      title: "Benga and beyond",
      category: { name: "Music", slug: "music" },
      questions: 10,
      plays: 480,
      avgRating: 4.0,
      publishedDaysAgo: 40,
    },
    creator: {
      id: 3,
      name: "Amina Wanjiru",
      former: false,
      published: 6,
      strikes: 0,
    },
    reports: [
      report(
        "Kevin Njoroge",
        9,
        "HATE",
        3,
        "Question 6 makes fun of a community and the answer options are insulting.",
      ),
      report("Faith Mutua", 3, "HATE", 2),
      report(
        "Hassan Daud",
        15,
        "OTHER",
        2,
        "A few of the questions seem to target people.",
      ),
    ],
    decision: null,
  },
  {
    id: 2,
    status: "OPEN",
    hiddenAutomatically: false,
    quiz: {
      slug: "solar-system-essentials",
      title: "Solar system essentials",
      category: { name: "Science", slug: "science" },
      questions: 10,
      plays: 3120,
      avgRating: 4.6,
      publishedDaysAgo: 60,
    },
    creator: {
      id: 4,
      name: "Brian Otieno",
      former: false,
      published: 4,
      strikes: 0,
    },
    reports: [
      report(
        "Wanjiku Mwangi",
        12,
        "MISLEADING",
        4,
        "Question 3 says Pluto is the ninth planet, which is out of date.",
      ),
      report(
        "Lucy Achieng",
        34,
        "MISLEADING",
        1,
        "The moons question has the wrong answer marked correct.",
      ),
    ],
    decision: null,
  },
  {
    id: 3,
    status: "OPEN",
    hiddenAutomatically: false,
    quiz: {
      slug: "classic-rock-riffs",
      title: "Classic rock riffs",
      category: { name: "Music", slug: "music" },
      questions: 15,
      plays: 870,
      avgRating: 4.2,
      publishedDaysAgo: 90,
    },
    creator: {
      id: 5,
      name: "Lucy Achieng",
      former: false,
      published: 5,
      strikes: 0,
    },
    reports: [
      report(
        "Otieno Juma",
        27,
        "COPYRIGHT",
        5,
        "These questions are word for word from a quiz site I use.",
      ),
      report("Mercy Atieno", 6, "COPYRIGHT", 3),
    ],
    decision: null,
  },
  {
    id: 4,
    status: "OPEN",
    hiddenAutomatically: false,
    quiz: {
      slug: "flags-of-the-world",
      title: "Flags of the world",
      category: { name: "Geography", slug: "geography" },
      questions: 30,
      plays: 2890,
      avgRating: 4.5,
      publishedDaysAgo: 120,
    },
    creator: {
      id: 11,
      name: "Peter Kamau",
      former: false,
      published: 3,
      strikes: 1,
    },
    reports: [
      report(
        "Grace Lemayian",
        3,
        "SPAM",
        0,
        "The description links to a store.",
      ),
    ],
    decision: null,
  },
  {
    id: 5,
    status: "OPEN",
    hiddenAutomatically: false,
    quiz: {
      slug: "spice-route-trivia",
      title: "Spice route trivia",
      category: { name: "Food", slug: "food" },
      questions: 15,
      plays: 140,
      avgRating: null,
      publishedDaysAgo: 6,
    },
    creator: {
      id: 13,
      name: "Joseph Mutiso",
      former: true,
      published: 2,
      strikes: 1,
    },
    reports: [
      report(
        "Kevin Njoroge",
        9,
        "OTHER",
        1,
        "Every explanation says the same thing and reads like it was generated.",
      ),
    ],
    decision: null,
  },
  {
    id: 6,
    status: "OPEN",
    hiddenAutomatically: false,
    quiz: {
      slug: "oscar-winning-films",
      title: "Oscar-winning films",
      category: { name: "Movies", slug: "movies" },
      questions: 20,
      plays: 3320,
      avgRating: 4.5,
      publishedDaysAgo: 50,
    },
    creator: {
      id: 5,
      name: "Lucy Achieng",
      former: false,
      published: 5,
      strikes: 0,
    },
    reports: [
      report(
        "Brian Otieno",
        21,
        "MISLEADING",
        0,
        "Question 12 has the wrong year for Best Picture.",
      ),
    ],
    decision: null,
  },
  {
    id: 7,
    status: "DISMISSED",
    hiddenAutomatically: false,
    quiz: {
      slug: "python-or-pseudocode",
      title: "Python or pseudocode?",
      category: { name: "Technology", slug: "technology" },
      questions: 10,
      plays: 410,
      avgRating: 4.2,
      publishedDaysAgo: 70,
    },
    creator: {
      id: 4,
      name: "Brian Otieno",
      former: false,
      published: 4,
      strikes: 0,
    },
    reports: [report("Daniel Sang", 4, "SPAM", 12, "Looks like spam to me.")],
    decision: {
      by: "Njeri Kariuki",
      at: iso(11),
      note: "Checked the quiz and it is fine.",
    },
  },
  {
    id: 8,
    status: "SUSPENDED",
    hiddenAutomatically: false,
    quiz: {
      slug: "sci-fi-movie-quotes",
      title: "Sci-fi movie quotes",
      category: { name: "Movies", slug: "movies" },
      questions: 15,
      plays: 1420,
      avgRating: 4.3,
      publishedDaysAgo: 80,
    },
    creator: {
      id: 11,
      name: "Peter Kamau",
      former: false,
      published: 3,
      strikes: 1,
    },
    reports: [
      report(
        "Amina Wanjiru",
        120,
        "HATE",
        10,
        "Several quotes were edited to insult real people.",
      ),
      report("Lucy Achieng", 34, "HATE", 10),
      report("Hassan Daud", 15, "MISLEADING", 9),
    ],
    decision: {
      by: "Tom Kiprop",
      at: iso(9),
      note: "Several quotes were edited to insult real people. Remove them before it can be restored.",
    },
  },
  {
    id: 9,
    status: "DELETED",
    hiddenAutomatically: false,
    quiz: {
      slug: "famous-quotes-quiz",
      title: "Famous quotes quiz",
      category: { name: "History", slug: "history" },
      questions: 12,
      plays: 650,
      avgRating: 3.8,
      publishedDaysAgo: 100,
    },
    creator: {
      id: 13,
      name: "Joseph Mutiso",
      former: true,
      published: 2,
      strikes: 1,
    },
    reports: [
      report("Wanjiku Mwangi", 12, "COPYRIGHT", 42),
      report(
        "Brian Otieno",
        21,
        "COPYRIGHT",
        41,
        "Copied from a published book.",
      ),
    ],
    decision: {
      by: "Njeri Kariuki",
      at: iso(40),
      note: "Copied from a published book.",
    },
  },
];

// Stand-in for the real report queries. Real data groups quiz_reports by quiz
// and pages the open queue, the same way the users list is paged.
export async function getReports() {
  return { items: [...items] };
}
