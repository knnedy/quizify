import type { ComponentType } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ClockIcon,
  GlobeIcon,
  LinkIcon,
  LockIcon,
  RepeatIcon,
  ShuffleIcon,
} from "lucide-react";
import { DifficultyMeter } from "@/components/difficulty-meter";
import { getCategoryIcon } from "@/lib/category-icons";
import { cn } from "@/lib/utils";
import type { AdminQuizPreview, PreviewStatus, Visibility } from "../mock-data";

type IconType = ComponentType<{ className?: string }>;

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const statusStyle: Record<PreviewStatus, { label: string; tone: string }> = {
  PUBLISHED: { label: "Live", tone: "bg-correct-soft text-correct-ink" },
  HIDDEN: {
    label: "Hidden automatically",
    tone: "bg-incorrect-soft text-incorrect-ink",
  },
  SUSPENDED: { label: "Suspended", tone: "bg-streak-soft text-streak-ink" },
  DELETED: { label: "Deleted", tone: "bg-incorrect-soft text-incorrect-ink" },
};

const visibilityInfo: Record<Visibility, { label: string; Icon: IconType }> = {
  PUBLIC: { label: "Public", Icon: GlobeIcon },
  UNLISTED: { label: "Unlisted", Icon: LinkIcon },
  PRIVATE: { label: "Private", Icon: LockIcon },
};

function ago(days: number) {
  if (days === 0) return "today";
  return days === 1 ? "1 day ago" : `${days} days ago`;
}

function Chip({
  Icon,
  children,
}: {
  Icon?: IconType;
  children: React.ReactNode;
}) {
  return (
    <li className="inline-flex items-center gap-1.5 rounded-full border bg-muted/40 px-3 py-1 text-sm">
      {Icon && <Icon aria-hidden className="size-3.5 text-muted-foreground" />}
      {children}
    </li>
  );
}

export function QuizOverview({
  quiz,
  status,
}: {
  quiz: AdminQuizPreview;
  status: PreviewStatus;
}) {
  const Icon = getCategoryIcon(quiz.category.slug);
  const style = statusStyle[status];
  const visibility = visibilityInfo[quiz.visibility];

  return (
    <header className="space-y-5 rounded-2xl border bg-card p-5 shadow-sm sm:p-7">
      <Link
        href="/admin/reports"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeftIcon aria-hidden className="size-4" />
        Reports
      </Link>

      <div className="flex flex-wrap items-start gap-x-5 gap-y-4">
        <span
          aria-hidden
          className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-primary">
          <Icon className="size-7" />
        </span>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="text-3xl">{quiz.title}</h1>
            <span
              className={cn(
                "rounded-full px-3 py-1 text-sm font-semibold",
                style.tone,
              )}>
              {style.label}
            </span>
          </div>

          <p className="max-w-prose text-muted-foreground">
            {quiz.description}
          </p>

          <p className="text-sm text-muted-foreground tabular-nums">
            {quiz.category.name} · by{" "}
            <Link
              href={`/admin/users/${quiz.creator.id}`}
              className="font-medium text-foreground hover:underline">
              {quiz.creator.name}
            </Link>{" "}
            · published {ago(quiz.publishedDaysAgo)} ·{" "}
            {compact.format(quiz.plays)} plays
          </p>
        </div>
      </div>

      <ul className="flex flex-wrap gap-2">
        <Chip>
          <DifficultyMeter difficulty={quiz.difficulty} />
        </Chip>
        <Chip Icon={ClockIcon}>
          {quiz.timeLimitMinutes
            ? `${quiz.timeLimitMinutes} min limit`
            : "No time limit"}
        </Chip>
        <Chip Icon={RepeatIcon}>
          {quiz.maxAttempts
            ? `${quiz.maxAttempts} attempts each`
            : "Unlimited attempts"}
        </Chip>
        {quiz.shuffleQuestions && (
          <Chip Icon={ShuffleIcon}>Shuffles questions</Chip>
        )}
        {quiz.shuffleOptions && (
          <Chip Icon={ShuffleIcon}>Shuffles answers</Chip>
        )}
        <Chip Icon={visibility.Icon}>{visibility.label}</Chip>
        {quiz.tags.map((tag) => (
          <li
            key={tag}
            className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
            {tag}
          </li>
        ))}
      </ul>
    </header>
  );
}
