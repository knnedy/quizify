import type { ReactNode } from "react";
import {
  CheckIcon,
  FlameIcon,
  LockIcon,
  TrophyIcon,
  ZapIcon,
} from "lucide-react";
import { Keycap } from "@/components/keycap";
import { cn } from "@/lib/utils";
import { leaderboard } from "./mock-data";

const week = [
  { day: "M", state: "done" },
  { day: "T", state: "done" },
  { day: "W", state: "done" },
  { day: "T", state: "done" },
  { day: "F", state: "today" },
  { day: "S", state: "upcoming" },
  { day: "S", state: "upcoming" },
] as const;

const achievements = [
  {
    title: "First steps",
    description: "Finish your first quiz",
    reward: "+50 XP",
    earned: true,
    icon: TrophyIcon,
  },
  {
    title: "On fire",
    description: "Keep a 7 day streak",
    reward: "+150 XP",
    earned: true,
    icon: FlameIcon,
  },
  {
    title: "Perfectionist",
    description: "Score 100% on a quiz",
    reward: "+200 XP",
    earned: false,
    icon: LockIcon,
  },
];

function FeatureCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <article className="flex flex-col gap-6 rounded-2xl border bg-card p-6 shadow-xs">
      <div className="space-y-1.5">
        <h3 className="text-xl">{title}</h3>
        <p className="max-w-prose text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="mt-auto rounded-xl border bg-muted/50 p-4">
        {children}
      </div>
    </article>
  );
}

const format = new Intl.NumberFormat("en-US");

export default function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-20 border-y bg-muted/40">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <div className="mb-12 space-y-2">
          <h2 className="text-3xl sm:text-4xl">More than a score</h2>
          <p className="max-w-prose text-base text-muted-foreground">
            Every quiz feeds your progress, so there is always a reason to play
            one more.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <FeatureCard
            title="Streaks that stick"
            description="Finish a quiz a day to keep your streak going. Miss a day and it starts over, but your best streak is always saved.">
            <div className="flex items-center justify-between gap-2">
              {week.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <span
                    className={cn(
                      "flex size-9 items-center justify-center rounded-full",
                      d.state === "done" && "bg-streak-soft text-streak",
                      d.state === "today" &&
                        "border-2 border-dashed border-streak text-streak",
                      d.state === "upcoming" && "border text-muted-foreground",
                    )}>
                    {d.state !== "upcoming" && (
                      <FlameIcon
                        className={cn(
                          "size-4",
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
          </FeatureCard>

          <FeatureCard
            title="Climb the leaderboard"
            description="See how you rank against other players. Your best result on each quiz is what counts.">
            <ul className="space-y-1.5">
              {leaderboard.map((row) => (
                <li
                  key={row.rank}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border px-3 py-2 text-sm",
                    row.isYou
                      ? "border-primary/40 bg-primary-soft"
                      : "border-transparent",
                  )}>
                  <span className="w-4 font-display font-bold text-muted-foreground tabular-nums">
                    {row.rank}
                  </span>
                  <span className="flex size-7 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                    {row.name[0]}
                  </span>
                  <span className="flex-1 font-medium">{row.name}</span>
                  <span className="flex items-center gap-1 font-semibold text-xp-ink tabular-nums">
                    <ZapIcon className="size-3.5" />
                    {format.format(row.xp)}
                  </span>
                </li>
              ))}
            </ul>
          </FeatureCard>

          <FeatureCard
            title="Unlock achievements"
            description="Hit milestones to earn badges and bonus XP. Some are hidden until you find them.">
            <ul className="space-y-2">
              {achievements.map(
                ({ title, description, reward, earned, icon: Icon }) => (
                  <li key={title} className="flex items-center gap-3 text-sm">
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-lg",
                        earned
                          ? "bg-xp-soft text-xp-ink"
                          : "bg-muted text-muted-foreground",
                      )}>
                      <Icon className="size-4.5" />
                    </span>
                    <span className="flex-1">
                      <span className="block font-medium">{title}</span>
                      <span className="block text-xs text-muted-foreground">
                        {description}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "text-xs font-semibold tabular-nums",
                        earned ? "text-xp-ink" : "text-muted-foreground",
                      )}>
                      {reward}
                    </span>
                  </li>
                ),
              )}
            </ul>
          </FeatureCard>

          <FeatureCard
            title="Write your own"
            description="Set a title, category and difficulty, add questions with explanations, and keep it as a draft until you are ready to publish.">
            <div className="space-y-3">
              <div className="rounded-lg border bg-card px-3 py-2 text-sm font-medium">
                Solar system essentials
              </div>
              <div className="space-y-1.5">
                <p className="text-sm text-muted-foreground">
                  Which planet is closest to the Sun?
                </p>
                {["Venus", "Mercury"].map((label, i) => (
                  <div
                    key={label}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg border px-2.5 py-1.5 text-sm",
                      i === 1
                        ? "border-correct/40 bg-correct-soft text-correct-ink"
                        : "bg-card text-muted-foreground",
                    )}>
                    <Keycap
                      className={cn(
                        i === 1 && "border-correct bg-correct text-white",
                      )}>
                      {i === 1 ? (
                        <CheckIcon className="size-3.5 stroke-3" />
                      ) : (
                        "A"
                      )}
                    </Keycap>
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </FeatureCard>
        </div>
      </div>
    </section>
  );
}
