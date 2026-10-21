import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import {
  ClockIcon,
  FlameIcon,
  FlaskConicalIcon,
  GlobeIcon,
  LandmarkIcon,
  ListChecksIcon,
  StarIcon,
  ZapIcon,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Keycap } from "./components/keycap";
import { QuizDemo } from "./components/quiz-demo";
import { ThemeSwitcher } from "./components/theme-switcher";

export const metadata: Metadata = {
  title: "Design system",
  robots: { index: false, follow: false },
};

const surfaces = [
  { name: "background", bg: "bg-background" },
  { name: "card", bg: "bg-card" },
  { name: "muted", bg: "bg-muted" },
  { name: "accent", bg: "bg-accent" },
  { name: "border", bg: "bg-border" },
  { name: "foreground", bg: "bg-foreground" },
];

const brand = [
  { name: "primary", bg: "bg-primary" },
  { name: "primary-soft", bg: "bg-primary-soft" },
];

const signals = [
  {
    name: "Correct",
    solid: "bg-correct",
    soft: "bg-correct-soft",
    ink: "bg-correct-ink",
  },
  {
    name: "Incorrect",
    solid: "bg-incorrect",
    soft: "bg-incorrect-soft",
    ink: "bg-incorrect-ink",
  },
  { name: "XP", solid: "bg-xp", soft: "bg-xp-soft", ink: "bg-xp-ink" },
  {
    name: "Streak",
    solid: "bg-streak",
    soft: "bg-streak-soft",
    ink: "bg-streak-ink",
  },
];

const typeScale = [
  {
    label: "Hero headline",
    classes: "font-display text-6xl font-bold leading-[1.02] tracking-tight",
    sample: "Test what you know",
  },
  {
    label: "Page title",
    classes: "font-display text-4xl font-bold tracking-tight",
    sample: "Browse quizzes",
  },
  {
    label: "Section heading",
    classes: "font-display text-2xl font-semibold tracking-tight",
    sample: "Popular this week",
  },
  {
    label: "Quiz question",
    classes: "font-display text-2xl font-bold leading-snug",
    sample: "Which planet has the most known moons?",
  },
  {
    label: "Body",
    classes: "max-w-prose text-base leading-relaxed",
    sample:
      "Pick a quiz, answer at your own pace and watch your score, streak and XP grow with every round you finish.",
  },
  {
    label: "Secondary text",
    classes: "text-sm text-muted-foreground",
    sample: "Created by Amina W. and played 1,284 times",
  },
  {
    label: "Score and numbers",
    classes: "font-display text-6xl font-bold tabular-nums",
    sample: "8/10",
  },
];

const sampleQuizzes: {
  category: string;
  title: string;
  description: string;
  level: string;
  levelNumber: 1 | 2 | 3;
  questions: number;
  minutes: number;
  rating: string;
  author: string;
  icon: LucideIcon;
}[] = [
  {
    category: "Geography",
    title: "Capital cities of Africa",
    description:
      "Match every capital to its country, from Nairobi to Windhoek.",
    level: "Beginner",
    levelNumber: 1,
    questions: 12,
    minutes: 6,
    rating: "4.8",
    author: "Amina W.",
    icon: GlobeIcon,
  },
  {
    category: "Science",
    title: "Solar system essentials",
    description: "From the rocky inner planets to the ice giants at the edge.",
    level: "Intermediate",
    levelNumber: 2,
    questions: 10,
    minutes: 5,
    rating: "4.6",
    author: "Brian O.",
    icon: FlaskConicalIcon,
  },
  {
    category: "History",
    title: "The scramble for Africa",
    description:
      "Treaties, borders and resistance movements, with no easy answers.",
    level: "Advanced",
    levelNumber: 3,
    questions: 20,
    minutes: 15,
    rating: "4.4",
    author: "Wanjiku M.",
    icon: LandmarkIcon,
  },
];

const segmentSample = [
  "bg-correct",
  "bg-correct",
  "bg-incorrect",
  "bg-correct",
  "bg-primary",
  "bg-border",
  "bg-border",
  "bg-border",
  "bg-border",
  "bg-border",
];

const timerSamples = [
  {
    label: "Plenty of time",
    seconds: "0:18",
    width: "w-[90%]",
    fill: "bg-primary",
  },
  {
    label: "Getting low",
    seconds: "0:08",
    width: "w-[40%]",
    fill: "bg-streak",
  },
  {
    label: "Almost out",
    seconds: "0:03",
    width: "w-[15%]",
    fill: "bg-incorrect",
  },
];

const week = [
  { day: "M", state: "done" },
  { day: "T", state: "done" },
  { day: "W", state: "done" },
  { day: "T", state: "done" },
  { day: "F", state: "today" },
  { day: "S", state: "upcoming" },
  { day: "S", state: "upcoming" },
] as const;

function BrandMark() {
  return (
    <svg viewBox="0 0 32 32" className="size-8" role="img" aria-label="Quizify">
      <rect width="32" height="32" rx="9" className="fill-primary" />
      <circle
        cx="15"
        cy="15"
        r="6.5"
        fill="none"
        stroke="white"
        strokeWidth="3"
      />
      <path
        d="M19.5 19.5 24 24"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-3xl">{title}</h2>
        <p className="max-w-prose text-base text-muted-foreground">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}

function Swatch({ name, bg }: { name: string; bg: string }) {
  return (
    <div className="space-y-2">
      <div className={cn("h-16 rounded-lg border", bg)} />
      <div>
        <p className="text-sm font-medium">{name}</p>
        <code className="text-xs text-muted-foreground">{bg}</code>
      </div>
    </div>
  );
}

function LevelMeter({ level }: { level: 1 | 2 | 3 }) {
  return (
    <span className="flex items-end gap-0.5" aria-hidden>
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={cn(
            "w-1 rounded-full",
            n === 1 ? "h-2" : n === 2 ? "h-3" : "h-4",
            n <= level ? "bg-foreground" : "bg-border",
          )}
        />
      ))}
    </span>
  );
}

function ScoreRing({ score, total }: { score: number; total: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / total);
  const percent = Math.round((score / total) * 100);

  return (
    <div className="relative size-44">
      <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden>
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="10"
          className="stroke-muted"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="stroke-primary"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-5xl font-bold tabular-nums">
          {score}
          <span className="text-muted-foreground">/{total}</span>
        </span>
        <span className="text-sm text-muted-foreground">
          {percent}% correct
        </span>
      </div>
    </div>
  );
}

export default function DesignPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="mx-auto max-w-6xl space-y-20 px-6 py-10 pb-32">
      <header className="flex items-center gap-3">
        <BrandMark />
        <div className="leading-tight">
          <p className="font-display text-lg font-bold">Quizify</p>
          <p className="text-sm text-muted-foreground">Design system</p>
        </div>
      </header>

      <section className="relative overflow-hidden rounded-3xl border bg-card px-6 py-12 sm:px-12 sm:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_70%_at_85%_0%,var(--glow),transparent)]"
        />
        <div className="relative grid items-center gap-12 lg:grid-cols-[1fr_1.05fr]">
          <div className="space-y-6">
            <h1 className="text-5xl leading-[1.02] sm:text-6xl">
              Test what you know. Learn what you don&apos;t.
            </h1>
            <p className="max-w-md text-lg text-muted-foreground">
              Play quick quizzes, keep your streak alive and build your own for
              friends to try. Have a go at the question on the right, using your
              keyboard if you like.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="shadow-primary">
                Start playing
              </Button>
              <Button size="lg" variant="outline">
                Browse quizzes
              </Button>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <QuizDemo />
          </div>
        </div>
      </section>

      <Section
        title="Color"
        description="Neutral surfaces, one violet for actions and selection, and signal colors that only show up when something happens.">
        <div className="space-y-8">
          <div className="space-y-3">
            <h3 className="text-lg">Surfaces</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {surfaces.map((s) => (
                <Swatch key={s.name} {...s} />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg">Brand</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {brand.map((s) => (
                <Swatch key={s.name} {...s} />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg">Signals</h3>
            <p className="text-sm text-muted-foreground">
              Each signal has a solid for icons and fills, a soft tint for
              backgrounds, and an ink for text on that tint.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {signals.map((s) => (
                <div
                  key={s.name}
                  className="flex items-center gap-4 rounded-xl border bg-card p-4">
                  <div className="flex gap-2">
                    <span className={cn("size-9 rounded-full", s.solid)} />
                    <span
                      className={cn("size-9 rounded-full border", s.soft)}
                    />
                    <span className={cn("size-9 rounded-full", s.ink)} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{s.name}</p>
                    <code className="text-xs text-muted-foreground">
                      solid, soft, ink
                    </code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section
        title="Typography"
        description="Bricolage Grotesque for headings, questions and numbers. Figtree for everything else. Sentence case throughout.">
        <div className="divide-y rounded-2xl border bg-card">
          {typeScale.map((row) => (
            <div
              key={row.label}
              className="grid gap-2 p-5 md:grid-cols-[190px_1fr] md:items-baseline md:gap-6">
              <div className="space-y-1">
                <p className="text-sm font-medium">{row.label}</p>
                <code className="block text-xs break-words text-muted-foreground">
                  {row.classes}
                </code>
              </div>
              <p className={row.classes}>{row.sample}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Controls"
        description="Primary buttons get a faint top highlight. Everything else stays flat with a hairline border.">
        <div className="space-y-8 rounded-2xl border bg-card p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <Button className="shadow-primary">Start quiz</Button>
            <Button variant="secondary">Save for later</Button>
            <Button variant="outline">Preview</Button>
            <Button variant="ghost">Cancel</Button>
            <Button variant="destructive">Delete quiz</Button>
            <Button variant="link">Read more</Button>
            <Button disabled>Disabled</Button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="demo-title" className="text-sm font-medium">
                Quiz title
              </label>
              <Input id="demo-title" placeholder="Solar system essentials" />
            </div>
            <div className="space-y-2">
              <label htmlFor="demo-time" className="text-sm font-medium">
                Time limit in minutes
              </label>
              <Input id="demo-time" defaultValue="0" aria-invalid="true" />
              <p className="text-sm text-destructive">
                Enter a time limit of at least 1 minute.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Keycap>A</Keycap>
              <Keycap>B</Keycap>
              <Keycap>C</Keycap>
              <Keycap>D</Keycap>
              <span>Keycaps</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <LevelMeter level={1} />
                Beginner
              </span>
              <span className="flex items-center gap-2">
                <LevelMeter level={2} />
                Intermediate
              </span>
              <span className="flex items-center gap-2">
                <LevelMeter level={3} />
                Advanced
              </span>
            </div>
          </div>
        </div>
      </Section>

      <Section
        title="Quiz cards"
        description="Difficulty is a three-bar meter, not a color, and cards stay neutral. They lift a touch on hover.">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {sampleQuizzes.map((quiz) => {
            const Icon = quiz.icon;
            return (
              <article
                key={quiz.title}
                className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-foreground">
                      <Icon className="size-[18px]" />
                    </span>
                    {quiz.category}
                  </span>
                  <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <LevelMeter level={quiz.levelNumber} />
                    {quiz.level}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-xl">{quiz.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {quiz.description}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <ListChecksIcon className="size-4" />
                    {quiz.questions} questions
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ClockIcon className="size-4" />
                    {quiz.minutes} min
                  </span>
                  <span className="flex items-center gap-1.5">
                    <StarIcon className="size-4 fill-xp text-xp" />
                    {quiz.rating}
                  </span>
                </div>
                <div className="mt-auto flex items-center justify-between border-t pt-4">
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="flex size-6 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                      {quiz.author[0]}
                    </span>
                    {quiz.author}
                  </span>
                  <Button size="sm" variant="outline">
                    Play
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      </Section>

      <Section
        title="Progress and rewards"
        description="Progress records every answer. The timer line warms up as time runs out. Streaks read like a habit tracker.">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-6 rounded-2xl border bg-card p-6">
            <div className="space-y-2.5">
              <p className="text-sm font-medium">Quiz progress</p>
              <div className="flex gap-1.5">
                {segmentSample.map((bg, i) => (
                  <span
                    key={i}
                    className={cn("h-1.5 flex-1 rounded-full", bg)}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Right, wrong, current and still to come.
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-medium">Timer</p>
              {timerSamples.map((t) => (
                <div key={t.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t.label}</span>
                    <span className="font-medium tabular-nums">
                      {t.seconds}
                    </span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-muted">
                    <div className={cn("h-full", t.width, t.fill)} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 rounded-2xl border bg-card p-6 sm:flex-row sm:justify-around">
            <ScoreRing score={8} total={10} />
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-xp-soft px-3 py-1 text-sm font-semibold text-xp-ink">
                  <ZapIcon className="size-4" />
                  +120 XP
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-streak-soft px-3 py-1 text-sm font-semibold text-streak-ink">
                  <FlameIcon className="size-4" />5 day streak
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Level 5</span>
                  <span className="font-medium tabular-nums">340 / 500 XP</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-[68%] rounded-full bg-primary" />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6 lg:col-span-2">
            <p className="mb-4 text-sm font-medium">This week</p>
            <div className="flex justify-between gap-2 sm:justify-start sm:gap-5">
              {week.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <span
                    className={cn(
                      "flex size-10 items-center justify-center rounded-full",
                      d.state === "done" && "bg-streak-soft text-streak",
                      d.state === "today" &&
                        "border-2 border-dashed border-streak text-streak",
                      d.state === "upcoming" && "border text-muted-foreground",
                    )}>
                    {d.state !== "upcoming" && (
                      <FlameIcon
                        className={cn(
                          "size-5",
                          d.state === "done" && "fill-streak",
                        )}
                      />
                    )}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {d.day}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section
        title="Radius and depth"
        description="Radius is tiered by role. Shadows stay small, and dark mode leans on borders instead.">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "rounded-md", cls: "rounded-md" },
              { label: "rounded-xl", cls: "rounded-xl" },
              { label: "rounded-2xl", cls: "rounded-2xl" },
              { label: "rounded-full", cls: "rounded-full" },
            ].map((r) => (
              <div
                key={r.label}
                className={cn(
                  "flex h-20 items-center justify-center border bg-card text-sm",
                  r.cls,
                )}>
                {r.label}
              </div>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex h-20 items-center justify-center rounded-xl border bg-card text-sm shadow-xs">
              shadow-xs
            </div>
            <div className="flex h-20 items-center justify-center rounded-xl border bg-card text-sm shadow-sm">
              shadow-sm
            </div>
            <div className="flex h-20 items-center justify-center rounded-xl border bg-card text-sm shadow-md">
              shadow-md
            </div>
          </div>
        </div>
      </Section>

      <ThemeSwitcher />
    </div>
  );
}
