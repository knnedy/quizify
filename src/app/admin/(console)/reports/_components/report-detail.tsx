import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  EyeOffIcon,
  FileSearchIcon,
  GlobeIcon,
  StarIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { Keycap } from "@/components/keycap";
import { Button, buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  ESTABLISHED_REPORTER_QUIZZES,
  ago,
  canSuspendQuiz,
  isSerious,
  reasonCounts,
} from "@/lib/admin-reports";
import { getCategoryIcon } from "@/lib/category-icons";
import { formatDate } from "@/lib/format-date";
import { reportReasonInfo } from "@/lib/report-reasons";
import { appUrl } from "@/lib/site-urls";
import { cn } from "@/lib/utils";
import type {
  QuizVisibility,
  ReportedQuiz,
  ReportStatus,
} from "@/types/admin-reports";
import { ReasonChip } from "./reason-chip";
import { ReportSignals } from "./report-signals";

type Resolved = Exclude<ReportStatus, "OPEN">;

const resolvedStyle: Record<
  Resolved,
  { label: string; pill: string; panel: string }
> = {
  DISMISSED: {
    label: "Dismissed",
    pill: "bg-muted text-muted-foreground",
    panel: "border-border bg-muted/50",
  },
  SUSPENDED: {
    label: "Suspended",
    pill: "bg-streak-soft text-streak-ink",
    panel: "border-streak/30 bg-streak-soft text-streak-ink",
  },
  DELETED: {
    label: "Deleted",
    pill: "bg-incorrect-soft text-incorrect-ink",
    panel: "border-incorrect/30 bg-incorrect-soft text-incorrect-ink",
  },
};

const openPills: Record<QuizVisibility, { label: string; pill: string }> = {
  LIVE: { label: "Live", pill: "bg-correct-soft text-correct-ink" },
  HIDDEN_AUTO: {
    label: "Hidden automatically",
    pill: "bg-incorrect-soft text-incorrect-ink",
  },
  HIDDEN_STAFF: {
    label: "Suspended",
    pill: "bg-streak-soft text-streak-ink",
  },
  UNPUBLISHED: { label: "Unpublished", pill: "bg-muted text-muted-foreground" },
  DELETED: { label: "Deleted", pill: "bg-incorrect-soft text-incorrect-ink" },
};

// Where the quiz stands now, whatever was decided on the reports
const stateText: Record<QuizVisibility, string> = {
  LIVE: "The quiz is live.",
  HIDDEN_AUTO: "The quiz is still hidden automatically.",
  HIDDEN_STAFF: "The quiz is suspended.",
  UNPUBLISHED: "The creator has unpublished the quiz.",
  DELETED: "The quiz was removed for everyone.",
};

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="bg-card px-4 py-3.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-2 flex items-center font-display text-xl leading-none font-bold tabular-nums">
        {children}
      </dd>
    </div>
  );
}

export function ReportDetail({
  item,
  busy,
  onDismiss,
  onSuspend,
  onDelete,
  onBack,
}: {
  item: ReportedQuiz;
  busy: boolean;
  onDismiss: () => void;
  onSuspend: () => void;
  onDelete: () => void;
  onBack: () => void;
}) {
  const { quiz, creator, decision, status, visibility } = item;
  const Icon = getCategoryIcon(quiz.category.slug);
  const open = status === "OPEN";
  const pill =
    status === "OPEN" ? openPills[visibility] : resolvedStyle[status];
  const total = item.reports.length;
  const breakdown = reasonCounts(item.reports);
  const reports = [...item.reports].sort((a, b) => a.daysAgo - b.daysAgo);
  const removed = visibility === "DELETED";
  const publicHref = new URL(`/quizzes/${quiz.slug}`, appUrl).href;

  return (
    <article
      aria-labelledby="report-heading"
      className="flex min-h-0 flex-1 animate-in flex-col overflow-hidden rounded-2xl border bg-card shadow-sm duration-200 fade-in">
      <div className="min-h-0 flex-1 space-y-7 overflow-y-auto overscroll-contain p-5 sm:p-7">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground lg:hidden">
          <ArrowLeftIcon aria-hidden className="size-4" />
          All reports
        </button>

        <header className="flex flex-wrap items-center gap-4">
          <span
            aria-hidden
            className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-primary">
            <Icon className="size-6" />
          </span>

          <div className="min-w-0 flex-1 space-y-1">
            <h2 id="report-heading" className="truncate text-2xl">
              {quiz.title}
            </h2>
            <p className="text-sm text-muted-foreground tabular-nums">
              {quiz.category.name} · {quiz.questions} questions · {total}{" "}
              {total === 1 ? "report" : "reports"}
            </p>
          </div>

          <span
            className={cn(
              "rounded-full px-3 py-1 text-sm font-semibold",
              pill.pill,
            )}>
            {pill.label}
          </span>
        </header>

        {open && <ReportSignals item={item} />}

        <section aria-labelledby="reasons-heading" className="space-y-3">
          <h3 id="reasons-heading" className="text-base">
            Why they reported it
          </h3>
          <ul className="space-y-3 rounded-xl border p-4">
            {breakdown.map(({ reason, count }) => (
              <li key={reason} className="space-y-1.5">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="font-medium">
                    {reportReasonInfo[reason].label}
                  </span>
                  <span className="text-muted-foreground tabular-nums">
                    {count} of {total}
                  </span>
                </div>
                <div
                  aria-hidden
                  className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      isSerious(reason) ? "bg-incorrect" : "bg-primary",
                    )}
                    style={{ width: `${(count / total) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="reports-heading" className="space-y-3">
          <h3 id="reports-heading" className="text-base">
            What people said
          </h3>
          <ul className="space-y-3">
            {reports.map((report) => {
              const established =
                report.reporter.completed >= ESTABLISHED_REPORTER_QUIZZES;

              return (
                <li key={report.id} className="space-y-3 rounded-xl border p-4">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span
                      aria-hidden
                      className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary font-display text-base font-bold text-secondary-foreground">
                      {report.reporter.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {report.reporter.name}
                      </span>
                      <span className="block text-xs text-muted-foreground tabular-nums">
                        {established ? "Established player" : "New account"} ·{" "}
                        {report.reporter.completed} quizzes
                      </span>
                    </span>
                    <ReasonChip reason={report.reason} />
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {ago(report.daysAgo)}
                    </span>
                  </div>

                  {report.details && (
                    <blockquote className="border-l-2 border-primary pl-4 text-sm leading-relaxed">
                      {report.details}
                    </blockquote>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="quiz-heading" className="space-y-3">
          <h3 id="quiz-heading" className="text-base">
            The quiz
          </h3>

          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-4">
            <Fact label="Questions">{quiz.questions}</Fact>
            <Fact label="Plays">{compact.format(quiz.plays)}</Fact>
            <Fact label="Rating">
              {quiz.avgRating !== null ? (
                <span className="flex items-center gap-1.5">
                  <StarIcon aria-hidden className="size-4 fill-xp text-xp" />
                  {quiz.avgRating.toFixed(1)}
                </span>
              ) : (
                "None"
              )}
            </Fact>
            <Fact label="Published">
              <span className="text-base">
                {quiz.publishedDaysAgo === null
                  ? "Never"
                  : ago(quiz.publishedDaysAgo)}
              </span>
            </Fact>
          </dl>

          {!removed && (
            <div className="flex flex-wrap gap-2.5">
              <Link
                href={`/quizzes/${quiz.slug}`}
                className={buttonVariants({ variant: "outline", size: "sm" })}>
                <FileSearchIcon />
                Review questions
              </Link>
              {visibility === "LIVE" && (
                <a
                  href={publicHref}
                  className={buttonVariants({ variant: "ghost", size: "sm" })}>
                  <GlobeIcon />
                  Open public page
                </a>
              )}
            </div>
          )}
        </section>

        <section
          aria-label="Creator"
          className="flex flex-wrap items-center gap-4 rounded-xl border p-4">
          <span
            aria-hidden
            className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary font-display text-lg font-bold text-secondary-foreground">
            {(creator?.name ?? "F").charAt(0).toUpperCase()}
          </span>
          {creator ? (
            <>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/users/${creator.id}`}
                  className="block truncate font-medium hover:underline">
                  {creator.name}
                </Link>
                <p className="text-sm text-muted-foreground tabular-nums">
                  {creator.former ? "Former creator" : "Creator"} ·{" "}
                  {creator.published} published ·{" "}
                  {creator.strikes === 0
                    ? "no earlier actions"
                    : `${creator.strikes} earlier ${creator.strikes === 1 ? "action" : "actions"}`}
                </p>
              </div>
              <Link
                href={`/users/${creator.id}`}
                className={buttonVariants({ variant: "ghost", size: "sm" })}>
                View profile
              </Link>
            </>
          ) : (
            <div className="min-w-0 flex-1">
              <p className="font-medium">Former member</p>
              <p className="text-sm text-muted-foreground">
                The creator&rsquo;s account was deleted.
              </p>
            </div>
          )}
        </section>

        {decision && status !== "OPEN" && (
          <section
            aria-labelledby="decision-heading"
            className={cn(
              "space-y-2 rounded-xl border px-4 py-3.5",
              resolvedStyle[status].panel,
            )}>
            <h3 id="decision-heading" className="text-base">
              {resolvedStyle[status].label} by{" "}
              {decision.by ?? "a former staff member"} on{" "}
              {formatDate(decision.at)}
            </h3>
            <p className="text-sm">{stateText[visibility]}</p>
            {status === "SUSPENDED" && decision.note && (
              <>
                <p className="text-sm">The creator sees this message:</p>
                <p className="text-sm font-medium">{decision.note}</p>
              </>
            )}
          </section>
        )}
      </div>

      {open && (
        <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t bg-muted/30 px-5 py-4 sm:px-7">
          <p className="hidden items-center gap-1.5 text-xs text-muted-foreground md:flex">
            <Keycap className="h-5 min-w-5 text-[11px]">J</Keycap>
            <Keycap className="h-5 min-w-5 text-[11px]">K</Keycap>
            browse
            <Keycap className="h-5 min-w-5 text-[11px]">D</Keycap>
            dismiss
            <Keycap className="h-5 min-w-5 text-[11px]">S</Keycap>
            suspend
          </p>

          <div className="ml-auto flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={busy}
              onClick={onDismiss}>
              {busy ? <Spinner /> : <XIcon />}
              Dismiss
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={busy || !canSuspendQuiz(visibility)}
              onClick={onSuspend}>
              <EyeOffIcon />
              Suspend
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="lg"
              disabled={busy}
              onClick={onDelete}>
              <Trash2Icon />
              Delete
            </Button>
          </div>
        </footer>
      )}
    </article>
  );
}
