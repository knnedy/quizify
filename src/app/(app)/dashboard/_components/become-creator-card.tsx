import Link from "next/link";
import { PenLineIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Eligibility } from "../mock-data";

export function BecomeCreatorCard({
  eligibility,
}: {
  eligibility: Eligibility;
}) {
  const { completed, required } = eligibility;
  const eligible = completed >= required;
  const remaining = required - completed;

  return (
    <section
      aria-labelledby="creator-cta-heading"
      className="flex flex-col gap-6 rounded-2xl border border-primary/20 bg-primary-soft p-6 sm:flex-row sm:items-center sm:p-7">
      <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-primary">
        <PenLineIcon aria-hidden className="size-6" />
      </span>

      <div className="min-w-0 flex-1 space-y-2">
        <h2 id="creator-cta-heading" className="text-2xl">
          Make quizzes of your own
        </h2>
        <p className="max-w-prose text-muted-foreground">
          {eligible
            ? "You've played enough to know what a good quiz feels like. Send an application and a person will read it."
            : `Finish ${remaining} more ${remaining === 1 ? "quiz" : "quizzes"} to apply, so you know what a good one feels like.`}
        </p>

        {!eligible && (
          <div className="flex items-center gap-3 pt-1">
            <div
              role="progressbar"
              aria-label="Quizzes completed toward applying"
              aria-valuemin={0}
              aria-valuemax={required}
              aria-valuenow={completed}
              className="flex w-40 gap-1.5">
              {Array.from({ length: required }, (_, index) => (
                <span
                  key={index}
                  className={cn(
                    "h-2 flex-1 rounded-full",
                    index < completed ? "bg-primary" : "bg-primary/20",
                  )}
                />
              ))}
            </div>
            <span className="text-sm font-medium tabular-nums">
              {completed} of {required}
            </span>
          </div>
        )}
      </div>

      <Link
        href={eligible ? "/my-quizzes" : "/quizzes"}
        className={buttonVariants({
          size: "lg",
          variant: eligible ? "default" : "outline",
          className: cn("shrink-0", eligible && "shadow-primary"),
        })}>
        {eligible ? "Apply to become a creator" : "Browse quizzes"}
      </Link>
    </section>
  );
}
