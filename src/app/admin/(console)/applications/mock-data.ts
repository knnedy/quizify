export type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

export type Application = {
  id: number;
  status: ApplicationStatus;
  applicant: {
    name: string;
    email: string;
    joinedAt: string;
    accountAgeDays: number;
    quizzesCompleted: number;
    totalXp: number;
  };
  motivation: string;
  submittedAt: string;
  waitingDays: number;
  attempt: number;
  previous: { reason: string; reviewedAt: string } | null;
  decision: {
    reviewedBy: string;
    reviewedAt: string;
    reason: string | null;
  } | null;
};

type Seed = {
  id: number;
  status: ApplicationStatus;
  name: string;
  joinedDaysAgo: number;
  completed: number;
  xp: number;
  submittedDaysAgo: number;
  attempt: number;
  motivation: string;
  previous?: { reason: string; daysAgo: number };
  decision?: { daysAgo: number; reason: string | null };
};

const DAY = 86_400_000;
const BASE = Date.parse("2026-10-20");

function daysAgo(days: number) {
  return new Date(BASE - days * DAY).toISOString();
}

const seeds: Seed[] = [
  {
    id: 1,
    status: "PENDING",
    name: "Brian Otieno",
    joinedDaysAgo: 94,
    completed: 21,
    xp: 3640,
    submittedDaysAgo: 6,
    attempt: 1,
    motivation:
      "I teach high school physics in Kisumu and I want to build quizzes that match the KCSE syllabus. Students could revise by topic on their phones, and I can keep the explanations short and clear.",
  },
  {
    id: 2,
    status: "PENDING",
    name: "Wanjiku Mwangi",
    joinedDaysAgo: 41,
    completed: 12,
    xp: 1890,
    submittedDaysAgo: 4,
    attempt: 1,
    motivation:
      "History is my degree and my hobby. I would like to write quizzes on pre-colonial East African trade routes and the independence movements, with sources in the explanations.",
  },
  {
    id: 3,
    status: "PENDING",
    name: "Kevin Njoroge",
    joinedDaysAgo: 58,
    completed: 9,
    xp: 1420,
    submittedDaysAgo: 3,
    attempt: 2,
    motivation:
      "Last time I was too vague. I plan to make JavaScript and CSS quizzes for people learning front end, starting with closures, the event loop and the cascade. I work as a developer and I will write a clear explanation for every answer.",
    previous: {
      reason:
        "Tell us which topics you plan to cover and why you know them well, then apply again.",
      daysAgo: 21,
    },
  },
  {
    id: 4,
    status: "PENDING",
    name: "Faith Mutua",
    joinedDaysAgo: 5,
    completed: 3,
    xp: 310,
    submittedDaysAgo: 1,
    attempt: 1,
    motivation: "I like quizzes.",
  },
  {
    id: 5,
    status: "PENDING",
    name: "Hassan Daud",
    joinedDaysAgo: 77,
    completed: 15,
    xp: 2260,
    submittedDaysAgo: 0,
    attempt: 1,
    motivation:
      "Geography and travel. I have been to 14 countries and I want to make quizzes on flags, capitals and rivers, plus a series on the counties of Kenya.",
  },
  {
    id: 6,
    status: "APPROVED",
    name: "Lucy Achieng",
    joinedDaysAgo: 120,
    completed: 34,
    xp: 5120,
    submittedDaysAgo: 12,
    attempt: 1,
    motivation:
      "I run a film club and want to make quizzes on award winners, directors and film history, with a note on why each answer matters.",
    decision: { daysAgo: 10, reason: null },
  },
  {
    id: 7,
    status: "APPROVED",
    name: "Peter Kamau",
    joinedDaysAgo: 66,
    completed: 18,
    xp: 2780,
    submittedDaysAgo: 9,
    attempt: 1,
    motivation:
      "I am a chemistry student and I would like to build revision quizzes for the periodic table, bonding and reaction types.",
    decision: { daysAgo: 8, reason: null },
  },
  {
    id: 8,
    status: "REJECTED",
    name: "Daniel Sang",
    joinedDaysAgo: 30,
    completed: 4,
    xp: 450,
    submittedDaysAgo: 15,
    attempt: 1,
    motivation:
      "I want to share my online store with players and get more traffic to it, so I would add links in the quiz descriptions.",
    decision: {
      daysAgo: 14,
      reason:
        "Quizify isn't the place to promote products or websites, so we can't approve this one.",
    },
  },
  {
    id: 9,
    status: "REJECTED",
    name: "Grace Lemayian",
    joinedDaysAgo: 12,
    completed: 3,
    xp: 280,
    submittedDaysAgo: 20,
    attempt: 1,
    motivation:
      "I think I could make good quizzes about animals and nature because I like them a lot.",
    decision: {
      daysAgo: 18,
      reason:
        "Play a few more quizzes first so you know what players enjoy, then apply again.",
    },
  },
];

function build(seed: Seed): Application {
  return {
    id: seed.id,
    status: seed.status,
    applicant: {
      name: seed.name,
      email: `${seed.name.toLowerCase().replace(/[^a-z]+/g, ".")}@example.com`,
      joinedAt: daysAgo(seed.joinedDaysAgo),
      accountAgeDays: seed.joinedDaysAgo,
      quizzesCompleted: seed.completed,
      totalXp: seed.xp,
    },
    motivation: seed.motivation,
    submittedAt: daysAgo(seed.submittedDaysAgo),
    waitingDays: seed.submittedDaysAgo,
    attempt: seed.attempt,
    previous: seed.previous
      ? {
          reason: seed.previous.reason,
          reviewedAt: daysAgo(seed.previous.daysAgo),
        }
      : null,
    decision: seed.decision
      ? {
          reviewedBy: "Admin",
          reviewedAt: daysAgo(seed.decision.daysAgo),
          reason: seed.decision.reason,
        }
      : null,
  };
}

const all = seeds.map(build);

// Pending goes oldest first so nobody waits at the bottom of the queue.
// Decided ones show the most recent decision first.
export async function getApplications(options: { status: ApplicationStatus }) {
  const counts: Record<ApplicationStatus, number> = {
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0,
  };
  for (const application of all) counts[application.status] += 1;

  const items = all
    .filter((application) => application.status === options.status)
    .sort((a, b) => {
      if (options.status === "PENDING") return b.waitingDays - a.waitingDays;
      return (
        Date.parse(b.decision?.reviewedAt ?? b.submittedAt) -
        Date.parse(a.decision?.reviewedAt ?? a.submittedAt)
      );
    });

  return { items, counts };
}
