import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import {
  ClockIcon,
  FlameIcon,
  ListChecksIcon,
  StarIcon,
  ZapIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnswerDemo } from "./components/answer-demo";
import { MotionDemo } from "./components/motion-demo";
import { ThemeSwitcher } from "./components/theme-switcher";

export const metadata: Metadata = {
  title: "Design system",
  robots: { index: false, follow: false },
};

const surfaces = [
  { name: "background", classes: "bg-background text-foreground" },
  { name: "card", classes: "bg-card text-card-foreground" },
  { name: "popover", classes: "bg-popover text-popover-foreground" },
  { name: "muted", classes: "bg-muted text-muted-foreground" },
  { name: "secondary", classes: "bg-secondary text-secondary-foreground" },
  { name: "accent", classes: "bg-accent text-accent-foreground" },
];

const actions = [
  { name: "primary", classes: "bg-primary text-primary-foreground" },
  {
    name: "destructive",
    classes: "bg-destructive text-destructive-foreground",
  },
  { name: "highlight", classes: "bg-highlight text-highlight-foreground" },
];

const lines = [
  {
    name: "border",
    classes: "bg-background text-foreground border-4 border-border",
  },
  {
    name: "input",
    classes: "bg-background text-foreground border-4 border-input",
  },
  {
    name: "ring",
    classes: "bg-background text-foreground border-4 border-ring",
  },
];

const signals = [
  { name: "correct", classes: "bg-correct-soft text-correct" },
  { name: "incorrect", classes: "bg-incorrect-soft text-incorrect" },
  { name: "xp", classes: "bg-xp-soft text-xp" },
  { name: "streak", classes: "bg-streak-soft text-streak" },
  { name: "beginner", classes: "bg-beginner-soft text-beginner" },
  { name: "intermediate", classes: "bg-intermediate-soft text-intermediate" },
  { name: "advanced", classes: "bg-advanced-soft text-advanced" },
];

const charts = [
  "bg-chart-1",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-4",
  "bg-chart-5",
];

const typeScale = [
  {
    label: "Hero headline",
    classes: "font-display text-5xl font-bold leading-[1.05] tracking-tight",
    sample: "Learn something new",
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
    classes: "font-display text-2xl font-semibold",
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

const sampleQuizzes = [
  {
    category: "Geography",
    title: "Capital cities of Africa",
    description:
      "Match every capital to its country, from Nairobi to Windhoek.",
    level: "Beginner",
    levelClasses: "bg-beginner-soft text-beginner",
    questions: 12,
    minutes: 6,
    rating: "4.8",
    author: "Amina W.",
  },
  {
    category: "Science",
    title: "Solar system essentials",
    description: "From the rocky inner planets to the ice giants at the edge.",
    level: "Intermediate",
    levelClasses: "bg-intermediate-soft text-intermediate",
    questions: 10,
    minutes: 5,
    rating: "4.6",
    author: "Brian O.",
  },
  {
    category: "History",
    title: "The scramble for Africa",
    description:
      "Treaties, borders and resistance movements, with no easy answers.",
    level: "Advanced",
    levelClasses: "bg-advanced-soft text-advanced",
    questions: 20,
    minutes: 15,
    rating: "4.4",
    author: "Wanjiku M.",
  },
];

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
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="max-w-prose text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}

function Swatch({ name, classes }: { name: string; classes: string }) {
  return (
    <div className="space-y-2">
      <div
        className={`flex h-20 items-end rounded-xl p-3 font-display text-lg font-semibold ring-1 ring-border ring-inset ${classes}`}>
        Aa
      </div>
      <p className="text-sm font-medium">{name}</p>
    </div>
  );
}

function Signal({ name, classes }: { name: string; classes: string }) {
  return (
    <div className="space-y-2">
      <div className={`rounded-xl px-4 py-3 text-sm font-semibold ${classes}`}>
        {name}
      </div>
      <code className="block text-xs text-muted-foreground">{classes}</code>
    </div>
  );
}

export default function DesignPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="mx-auto max-w-6xl space-y-20 px-6 py-12 pb-32">
      <header className="space-y-3">
        <h1 className="text-4xl font-bold md:text-5xl">
          Quizify design system
        </h1>
        <p className="max-w-prose text-base leading-relaxed text-muted-foreground">
          Every token, type style and quiz component in one place. Use the
          switcher at the bottom to check light, dark and system themes.
        </p>
      </header>

      <Section
        title="Color"
        description="Surfaces and actions come from shadcn tokens. The highlighter marks state, never a headline word.">
        <div className="space-y-8">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Surfaces</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {surfaces.map((s) => (
                <Swatch key={s.name} {...s} />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Actions</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {actions.map((s) => (
                <Swatch key={s.name} {...s} />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Lines</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {lines.map((s) => (
                <Swatch key={s.name} {...s} />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Signals</h3>
            <p className="text-sm text-muted-foreground">
              Soft background with the matching text color. Difficulty always
              shows its label next to the color.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {signals.map((s) => (
                <Signal key={s.name} {...s} />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Charts</h3>
            <div className="flex gap-3">
              {charts.map((c) => (
                <div key={c} className={`h-12 flex-1 rounded-md ${c}`} />
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section
        title="Typography"
        description="Bricolage Grotesque for headings, questions and numbers. Figtree for everything else. Sentence case throughout.">
        <div className="divide-y rounded-xl border bg-card">
          {typeScale.map((row) => (
            <div
              key={row.label}
              className="grid gap-2 p-5 md:grid-cols-[180px_1fr] md:items-baseline md:gap-6">
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
        title="Buttons and inputs"
        description="Primary is the only solid brand fill. Everything else stays quiet.">
        <div className="space-y-6 rounded-xl border bg-card p-6">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Start quiz</Button>
            <Button variant="secondary">Save for later</Button>
            <Button variant="outline">Preview</Button>
            <Button variant="ghost">Cancel</Button>
            <Button variant="destructive">Delete quiz</Button>
            <Button variant="link">Read more</Button>
            <Button disabled>Disabled</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button>Default</Button>
            <Button size="lg">Large</Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="demo-title" className="text-sm font-medium">
                Quiz title
              </label>
              <Input id="demo-title" placeholder="Solar system essentials" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="demo-invalid" className="text-sm font-medium">
                Time limit in minutes
              </label>
              <Input id="demo-invalid" defaultValue="0" aria-invalid="true" />
              <p className="text-sm text-destructive">
                Enter a time limit of at least 1 minute.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section
        title="Quiz cards"
        description="Difficulty is a soft pill. The card carries the information, so there is no decoration.">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sampleQuizzes.map((quiz) => (
            <article
              key={quiz.title}
              className="flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {quiz.category}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${quiz.levelClasses}`}>
                  {quiz.level}
                </span>
              </div>
              <div className="space-y-1.5">
                <h3 className="font-display text-xl font-semibold">
                  {quiz.title}
                </h3>
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
                  <StarIcon className="size-4 fill-current text-xp" />
                  {quiz.rating}
                </span>
              </div>
              <div className="mt-auto flex items-center justify-between border-t pt-4">
                <span className="text-sm text-muted-foreground">
                  by {quiz.author}
                </span>
                <Button size="sm">Play</Button>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section
        title="Playing a quiz"
        description="Pick an option and check it. Selection is marked with the highlighter, and the result reuses the correct and incorrect signals.">
        <AnswerDemo />
      </Section>

      <Section
        title="Rewards"
        description="XP and streak chips, and the results score. Numbers use tabular figures so they do not jitter while counting.">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-xl border bg-card p-6 shadow-card">
            <div className="flex flex-wrap gap-3">
              <span className="flex items-center gap-1.5 rounded-full bg-xp-soft px-3.5 py-1.5 text-sm font-semibold text-xp">
                <ZapIcon className="size-4" />
                1,240 XP
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-streak-soft px-3.5 py-1.5 text-sm font-semibold text-streak">
                <FlameIcon className="size-4" />7 day streak
              </span>
              <span className="rounded-full bg-secondary px-3.5 py-1.5 text-sm font-semibold text-secondary-foreground">
                Level 5
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Next level</span>
                <span className="font-medium tabular-nums">340 / 500 XP</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[68%] rounded-full bg-primary" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-8 text-center shadow-card">
            <p className="text-sm text-muted-foreground">Your score</p>
            <p className="font-display text-7xl font-bold tabular-nums">
              8<span className="text-muted-foreground">/10</span>
            </p>
            <p className="mt-3 text-base">
              You earned{" "}
              <span className="highlighter font-semibold">+120 XP</span> and
              extended your streak.
            </p>
          </div>
        </div>
      </Section>

      <Section
        title="Radius, depth and motion"
        description="Radius is tiered by role. Shadows are tinted with the brand color. Motion only answers an action and respects reduced motion.">
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="flex h-24 items-center justify-center rounded-md border bg-card text-sm">
              rounded-md
            </div>
            <div className="flex h-24 items-center justify-center rounded-xl border bg-card text-sm">
              rounded-xl
            </div>
            <div className="flex h-24 items-center justify-center rounded-2xl border bg-card text-sm">
              rounded-2xl
            </div>
            <div className="flex h-24 items-center justify-center rounded-full border bg-card text-sm">
              rounded-full
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex h-24 items-center justify-center rounded-xl bg-card text-sm shadow-card">
              shadow-card
            </div>
            <div className="flex h-24 items-center justify-center rounded-xl bg-card text-sm shadow-pop">
              shadow-pop
            </div>
          </div>

          <MotionDemo />
        </div>
      </Section>

      <ThemeSwitcher />
    </div>
  );
}
