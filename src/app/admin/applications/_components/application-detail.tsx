import { ArrowLeftIcon, CheckIcon, Undo2Icon, XIcon } from "lucide-react";
import { Keycap } from "@/components/keycap";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import type { Application, ApplicationStatus } from "../mock-data";
import { ApplicationChecks } from "./application-checks";

export type DetailDecision = {
  by: string;
  at: string | null;
  reason: string | null;
};

const statusStyle: Record<ApplicationStatus, { label: string; tone: string }> =
  {
    PENDING: {
      label: "Waiting for review",
      tone: "bg-streak-soft text-streak-ink",
    },
    APPROVED: { label: "Approved", tone: "bg-correct-soft text-correct-ink" },
    REJECTED: {
      label: "Rejected",
      tone: "bg-incorrect-soft text-incorrect-ink",
    },
  };

export function ApplicationDetail({
  application,
  status,
  decision,
  onApprove,
  onReject,
  onUndo,
  onBack,
}: {
  application: Application;
  status: ApplicationStatus;
  decision: DetailDecision | null;
  onApprove: () => void;
  onReject: () => void;
  onUndo?: () => void;
  onBack: () => void;
}) {
  const { applicant } = application;
  const firstName = applicant.name.split(" ")[0];
  const style = statusStyle[status];
  const pending = status === "PENDING";
  const words = application.motivation.trim().split(/\s+/).length;

  const waiting =
    application.waitingDays === 0
      ? "Applied today"
      : `Waiting ${application.waitingDays} ${application.waitingDays === 1 ? "day" : "days"}`;

  return (
    <article
      aria-labelledby="application-heading"
      className="flex min-h-0 flex-1 animate-in flex-col overflow-hidden rounded-2xl border bg-card shadow-sm duration-200 fade-in">
      <div className="min-h-0 flex-1 space-y-7 overflow-y-auto overscroll-contain p-5 sm:p-7">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground lg:hidden">
          <ArrowLeftIcon aria-hidden className="size-4" />
          All applications
        </button>

        <header className="flex flex-wrap items-center gap-4">
          <span
            aria-hidden
            className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary font-display text-2xl font-bold text-primary-foreground shadow-primary">
            {applicant.name.charAt(0).toUpperCase()}
          </span>

          <div className="min-w-0 flex-1 space-y-1">
            <h2 id="application-heading" className="truncate text-2xl">
              {applicant.name}
            </h2>
            <p className="truncate text-sm text-muted-foreground">
              {applicant.email}
            </p>
          </div>

          <span
            className={cn(
              "rounded-full px-3 py-1 text-sm font-semibold",
              style.tone,
            )}>
            {pending ? waiting : style.label}
          </span>
        </header>

        <section aria-labelledby="words-heading" className="space-y-3">
          <h3 id="words-heading" className="text-base">
            In their words
          </h3>
          <blockquote className="border-l-2 border-primary pl-5 text-lg leading-relaxed">
            {application.motivation}
          </blockquote>
          <p className="text-sm text-muted-foreground tabular-nums">
            Applied {formatDate(application.submittedAt)} · {words}{" "}
            {words === 1 ? "word" : "words"}
          </p>
        </section>

        <ApplicationChecks application={application} />

        {application.previous && (
          <section
            aria-labelledby="previous-heading"
            className="space-y-2 rounded-xl border border-dashed px-4 py-3.5">
            <h3 id="previous-heading" className="text-sm font-semibold">
              Rejected before, on {formatDate(application.previous.reviewedAt)}
            </h3>
            <p className="text-sm text-muted-foreground">
              {application.previous.reason}
            </p>
          </section>
        )}

        {decision && !pending && (
          <section
            aria-labelledby="decision-heading"
            className={cn(
              "space-y-2 rounded-xl border px-4 py-3.5",
              status === "APPROVED"
                ? "border-correct/30 bg-correct-soft text-correct-ink"
                : "border-incorrect/30 bg-incorrect-soft text-incorrect-ink",
            )}>
            <h3
              id="decision-heading"
              className="flex items-center gap-2 text-base">
              {status === "APPROVED" ? (
                <CheckIcon aria-hidden className="size-4.5" />
              ) : (
                <XIcon aria-hidden className="size-4.5" />
              )}
              {style.label} by {decision.by}
              {decision.at ? ` on ${formatDate(decision.at)}` : " just now"}
            </h3>
            {status === "APPROVED" && (
              <p className="text-sm">{firstName} can create quizzes now.</p>
            )}
            {decision.reason && <p className="text-sm">{decision.reason}</p>}
            {onUndo && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="-ml-2"
                onClick={onUndo}>
                <Undo2Icon />
                Undo decision
              </Button>
            )}
          </section>
        )}
      </div>

      {pending && (
        <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t bg-muted/30 px-5 py-4 sm:px-7">
          <p className="hidden items-center gap-1.5 text-xs text-muted-foreground md:flex">
            <Keycap className="h-5 min-w-5 text-[11px]">J</Keycap>
            <Keycap className="h-5 min-w-5 text-[11px]">K</Keycap>
            browse
            <Keycap className="h-5 min-w-5 text-[11px]">R</Keycap>
            reject
            <Keycap className="h-5 min-w-5 text-[11px]">A</Keycap>
            approve
          </p>

          <div className="ml-auto flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onReject}>
              <XIcon />
              Reject
            </Button>
            <Button
              type="button"
              size="lg"
              className="shadow-primary"
              onClick={onApprove}>
              <CheckIcon />
              Approve
            </Button>
          </div>
        </footer>
      )}
    </article>
  );
}
