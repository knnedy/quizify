import Link from "next/link";
import {
  PenLineIcon,
  SlidersHorizontalIcon,
  TrendingUpIcon,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ApplyForm } from "./apply-form";

const perks = [
  {
    Icon: PenLineIcon,
    title: "Build quizzes your way",
    text: "Single answer, multiple answer and true or false questions, each with an explanation players see in the review.",
  },
  {
    Icon: SlidersHorizontalIcon,
    title: "Control how they play",
    text: "Add a time limit, shuffle questions and options, and choose whether a quiz is public, unlisted or private.",
  },
  {
    Icon: TrendingUpIcon,
    title: "See how they do",
    text: "Follow plays, ratings and the leaderboard for every quiz you publish.",
  },
];

export function CreatorPitch({
  completed,
  required,
}: {
  completed: number;
  required: number;
}) {
  const eligible = completed >= required;
  const remaining = required - completed;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-12">
      <div className="space-y-8">
        <ul className="space-y-6">
          {perks.map(({ Icon, title, text }) => (
            <li key={title} className="flex gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Icon aria-hidden className="size-5" />
              </span>
              <div className="space-y-1">
                <h2 className="text-lg">{title}</h2>
                <p className="text-muted-foreground">{text}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="rounded-xl border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          A person reads every application. This keeps the quizzes on Quizify
          worth playing.
        </p>
      </div>

      <section
        aria-labelledby="apply-heading"
        className="space-y-5 self-start rounded-2xl border bg-card p-6 shadow-sm">
        {eligible ? (
          <>
            <h2 id="apply-heading" className="text-xl">
              Apply to become a creator
            </h2>
            <ApplyForm />
          </>
        ) : (
          <>
            <div className="space-y-1.5">
              <h2 id="apply-heading" className="text-xl">
                Play {remaining} more {remaining === 1 ? "quiz" : "quizzes"} to
                apply
              </h2>
              <p className="text-sm text-muted-foreground">
                Finish {required} quizzes first, so you know what a good one
                feels like.
              </p>
            </div>

            <div className="space-y-2">
              <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={required}
                aria-valuenow={completed}
                className="flex gap-1.5">
                {Array.from({ length: required }, (_, index) => (
                  <span
                    key={index}
                    className={cn(
                      "h-2 flex-1 rounded-full",
                      index < completed ? "bg-primary" : "bg-muted",
                    )}
                  />
                ))}
              </div>
              <p className="text-sm font-medium text-muted-foreground tabular-nums">
                {completed} of {required} completed
              </p>
            </div>

            <Link
              href="/quizzes"
              className={buttonVariants({
                size: "lg",
                className: "w-full shadow-primary",
              })}>
              Browse quizzes
            </Link>
          </>
        )}
      </section>
    </div>
  );
}
