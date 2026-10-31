import { FlameIcon, GlobeIcon, ZapIcon, FlaskConicalIcon } from "lucide-react";
import { Keycap } from "@/components/keycap";
import { cn } from "@/lib/utils";

function StepNumber({ n }: { n: number }) {
  return (
    <span className="flex size-7 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">
      {n}
    </span>
  );
}

function PickPreview() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2.5 rounded-lg border border-primary bg-primary-soft px-3 py-2.5 text-sm font-medium">
        <GlobeIcon className="size-4" />
        Capital cities of Africa
      </div>
      <div className="flex items-center gap-2.5 rounded-lg border bg-card px-3 py-2.5 text-sm font-medium text-muted-foreground">
        <FlaskConicalIcon className="size-4" />
        Solar system essentials
      </div>
    </div>
  );
}

function PlayPreview() {
  const options = ["Lagos", "Nairobi", "Kampala"];
  return (
    <div className="space-y-2.5">
      <div className="h-1 overflow-hidden rounded-full bg-muted">
        <div className="h-full w-3/5 rounded-full bg-primary" />
      </div>
      <div className="space-y-1.5">
        {options.map((label, i) => (
          <div
            key={label}
            className={cn(
              "flex items-center gap-2.5 rounded-lg border px-2.5 py-1.5 text-sm font-medium",
              i === 1
                ? "border-primary bg-primary-soft"
                : "bg-card text-muted-foreground",
            )}>
            <Keycap
              className={cn(
                i === 1 && "border-primary bg-primary text-primary-foreground",
              )}>
              {["A", "B", "C"][i]}
            </Keycap>
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

function RewardPreview() {
  return (
    <div className="space-y-3">
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
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Level 5</span>
          <span className="font-medium tabular-nums">340 / 500 XP</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-[68%] rounded-full bg-primary" />
        </div>
      </div>
    </div>
  );
}

const steps = [
  {
    title: "Pick a quiz",
    description:
      "Browse by topic or difficulty, or open a popular one. No account needed to look around.",
    preview: <PickPreview />,
  },
  {
    title: "Answer against the clock",
    description:
      "Tap an answer or press its letter. Timed quizzes show a line that runs out as you go.",
    preview: <PlayPreview />,
  },
  {
    title: "Earn XP and level up",
    description:
      "Every finished quiz adds XP and extends your streak, so your progress builds with each round.",
    preview: <RewardPreview />,
  },
];

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20 sm:py-24">
      <div className="mb-12 space-y-2">
        <h2 className="text-3xl sm:text-4xl">How Quizify works</h2>
        <p className="max-w-prose text-base text-muted-foreground">
          From picking a quiz to leveling up, in three steps.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {steps.map((step, index) => (
          <article
            key={step.title}
            className="flex flex-col gap-5 rounded-2xl border bg-card p-6 shadow-xs">
            <div className="flex items-center gap-3">
              <StepNumber n={index + 1} />
              <h3 className="text-xl">{step.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{step.description}</p>
            <div className="mt-auto rounded-xl border bg-muted/50 p-4">
              {step.preview}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
