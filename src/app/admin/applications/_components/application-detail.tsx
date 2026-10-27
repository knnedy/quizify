"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeftIcon, CheckIcon, CircleAlertIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import type { Application, ApplicationStatus } from "../mock-data";
import { RejectDialog } from "./reject-dialog";

type Outcome = { status: "APPROVED" } | { status: "REJECTED"; reason: string };

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

function formatAge(days: number) {
  if (days < 60) return days === 1 ? "1 day" : `${days} days`;
  return `${Math.floor(days / 30)} months`;
}

function getNotes(application: Application) {
  const notes: string[] = [];

  if (application.applicant.accountAgeDays < 14) {
    notes.push("Account is under two weeks old");
  }
  if (application.attempt > 1) {
    notes.push(`Application number ${application.attempt}`);
  }
  if (application.motivation.trim().length < 60) {
    notes.push("Very short answer");
  }

  return notes;
}

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col-reverse gap-1.5 px-4 py-3.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-display text-xl leading-none font-bold tabular-nums">
        {children}
      </dd>
    </div>
  );
}

export function ApplicationDetail({
  application,
  backHref,
}: {
  application: Application;
  backHref: string;
}) {
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  const { applicant } = application;
  const firstName = applicant.name.split(" ")[0];

  const status: ApplicationStatus = outcome
    ? outcome.status
    : application.status;
  const reviewer = outcome ? "you" : (application.decision?.reviewedBy ?? null);
  const reason = outcome
    ? outcome.status === "REJECTED"
      ? outcome.reason
      : null
    : (application.decision?.reason ?? null);

  const notes = status === "PENDING" ? getNotes(application) : [];
  const style = statusStyle[status];
  const waiting =
    application.waitingDays === 0
      ? "Applied today"
      : `Waiting ${application.waitingDays} ${application.waitingDays === 1 ? "day" : "days"}`;

  function approve() {
    setOutcome({ status: "APPROVED" });
    toast.success(`${firstName} is now a creator`, {
      action: { label: "Undo", onClick: () => setOutcome(null) },
    });
  }

  function reject(message: string) {
    setOutcome({ status: "REJECTED", reason: message });
    toast.success(`Application rejected. ${firstName} will see your message.`);
  }

  return (
    <article
      aria-labelledby="application-heading"
      className="space-y-6 rounded-2xl border bg-card p-5 shadow-sm sm:p-7">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground lg:hidden">
        <ArrowLeftIcon className="size-4" />
        All applications
      </Link>

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
          {status === "PENDING" ? waiting : style.label}
        </span>
      </header>

      <dl className="grid grid-cols-3 divide-x rounded-xl border bg-muted/40">
        <Stat label="quizzes completed">{applicant.quizzesCompleted}</Stat>
        <Stat label="total XP">
          {applicant.totalXp.toLocaleString("en-US")}
        </Stat>
        <Stat label="member for">{formatAge(applicant.accountAgeDays)}</Stat>
      </dl>

      {notes.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {notes.map((note) => (
            <li
              key={note}
              className="inline-flex items-center gap-1.5 rounded-full bg-streak-soft px-3 py-1 text-sm font-medium text-streak-ink">
              <CircleAlertIcon aria-hidden className="size-4" />
              {note}
            </li>
          ))}
        </ul>
      )}

      <section aria-labelledby="motivation-heading" className="space-y-2.5">
        <h3 id="motivation-heading" className="text-base">
          Why they want to create quizzes
        </h3>
        <p className="rounded-xl bg-muted/50 px-4 py-3.5 text-[15px] leading-relaxed">
          {application.motivation}
        </p>
        <p className="text-sm text-muted-foreground">
          Applied {formatDate(application.submittedAt)}
        </p>
      </section>

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

      {status !== "PENDING" && (
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
            {style.label} by {reviewer ?? "an admin"}
            {outcome
              ? " just now"
              : application.decision
                ? ` on ${formatDate(application.decision.reviewedAt)}`
                : ""}
          </h3>
          {status === "APPROVED" && (
            <p className="text-sm">{firstName} can create quizzes now.</p>
          )}
          {reason && <p className="text-sm">{reason}</p>}
        </section>
      )}

      {status === "PENDING" && (
        <div className="flex flex-wrap items-center justify-end gap-3 border-t pt-5">
          <RejectDialog name={applicant.name} onReject={reject} />
          <Button size="lg" className="shadow-primary" onClick={approve}>
            <CheckIcon />
            Approve
          </Button>
        </div>
      )}
    </article>
  );
}
