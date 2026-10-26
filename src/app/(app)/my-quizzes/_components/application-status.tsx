import Link from "next/link";
import { CircleAlertIcon, ClockIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { formatDate } from "@/lib/format-date";
import type { MyQuizzesView } from "../mock-data";
import { ApplyForm } from "./apply-form";

type StatusView = Extract<MyQuizzesView, { state: "pending" | "rejected" }>;

export function ApplicationStatus({ view }: { view: StatusView }) {
  if (view.state === "pending") {
    return (
      <section
        aria-labelledby="status-heading"
        className="mx-auto flex max-w-xl flex-col items-center gap-5 rounded-2xl border bg-card px-6 py-12 text-center shadow-xs">
        <span className="flex size-14 items-center justify-center rounded-full bg-streak-soft text-streak-ink">
          <ClockIcon aria-hidden className="size-6" />
        </span>
        <div className="space-y-2">
          <h2 id="status-heading" className="text-2xl">
            Your application is in review
          </h2>
          <p className="text-muted-foreground">
            You applied on {formatDate(view.application.submittedAt)}. The
            result will show up on this page.
          </p>
        </div>
        <Link
          href="/quizzes"
          className={buttonVariants({ variant: "outline", size: "lg" })}>
          Keep playing meanwhile
        </Link>
      </section>
    );
  }

  const { application, canReapply } = view;

  return (
    <section
      aria-labelledby="status-heading"
      className="mx-auto max-w-xl space-y-6 rounded-2xl border bg-card p-6 shadow-xs sm:p-8">
      <div className="flex items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-incorrect-soft text-incorrect-ink">
          <CircleAlertIcon aria-hidden className="size-6" />
        </span>
        <div className="space-y-1">
          <h2 id="status-heading" className="text-2xl">
            Not approved this time
          </h2>
          {application.reviewedAt && (
            <p className="text-sm text-muted-foreground">
              Reviewed on {formatDate(application.reviewedAt)}
            </p>
          )}
        </div>
      </div>

      {application.rejectionReason && (
        <div className="space-y-1.5 rounded-xl bg-muted/50 px-4 py-3.5">
          <p className="text-sm font-medium">Feedback</p>
          <p className="text-[15px] leading-relaxed text-muted-foreground">
            {application.rejectionReason}
          </p>
        </div>
      )}

      {canReapply ? (
        <div className="space-y-4 border-t pt-6">
          <p className="font-medium">You can apply again</p>
          <ApplyForm />
        </div>
      ) : (
        application.canReapplyAt && (
          <p className="border-t pt-6 text-muted-foreground">
            You can apply again on {formatDate(application.canReapplyAt)}.
          </p>
        )
      )}
    </section>
  );
}
