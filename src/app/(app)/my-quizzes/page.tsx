import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon, SearchXIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/server/session";
import { ApplicationStatus } from "./_components/application-status";
import { CreatorPitch } from "./_components/creator-pitch";
import { CreatorSummary } from "./_components/creator-summary";
import { QuizRow } from "./_components/quiz-row";
import {
  QuizTabs,
  filterLabel,
  filterStatus,
  parseStatusFilter,
} from "./_components/quiz-tabs";
import {
  getMyQuizzesView,
  type MyQuizStatus,
  type MyQuizzesView,
} from "./mock-data";

export const metadata: Metadata = { title: "My quizzes" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getHeroCopy(view: MyQuizzesView) {
  switch (view.state) {
    case "creator":
      return {
        title: "My quizzes",
        text: "Create, edit and keep an eye on the quizzes you have made.",
      };
    case "pending":
      return {
        title: "Creator application",
        text: "Thanks for applying. A person is reading your application.",
      };
    case "rejected":
      return {
        title: "Creator application",
        text: "Your last application was not approved. Here is why.",
      };
    case "none":
      return {
        title: "Become a creator",
        text: "Build quizzes for everyone on Quizify to play.",
      };
  }
}

export default async function MyQuizzesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const raw = await searchParams;
  await requireUser("/my-quizzes");

  const completed = Number.parseInt(first(raw.completed) ?? "", 10);
  const view = await getMyQuizzesView({
    preview: first(raw.as),
    completed: Number.isFinite(completed) ? completed : undefined,
  });

  const filter = parseStatusFilter(first(raw.status));
  const hero = getHeroCopy(view);

  return (
    <main>
      <section className="relative overflow-hidden border-b">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_70%_at_90%_0%,var(--glow),transparent)]"
        />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-end sm:justify-between sm:py-14">
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl">{hero.title}</h1>
            <p className="max-w-prose text-base text-muted-foreground">
              {hero.text}
            </p>
          </div>
          {view.state === "creator" && (
            <Link
              href="/my-quizzes/new"
              className={buttonVariants({
                size: "lg",
                className: "shadow-primary",
              })}>
              <PlusIcon />
              New quiz
            </Link>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-10">
        {view.state === "none" && (
          <CreatorPitch completed={view.completed} required={view.required} />
        )}

        {(view.state === "pending" || view.state === "rejected") && (
          <ApplicationStatus view={view} />
        )}

        {view.state === "creator" && (
          <CreatorQuizzes view={view} filter={filter} />
        )}
      </div>
    </main>
  );
}

function CreatorQuizzes({
  view,
  filter,
}: {
  view: Extract<MyQuizzesView, { state: "creator" }>;
  filter: ReturnType<typeof parseStatusFilter>;
}) {
  const { quizzes, summary } = view;

  if (quizzes.length === 0) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-5 rounded-2xl border border-dashed px-6 py-16 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary">
          <PlusIcon aria-hidden className="size-6" />
        </span>
        <div className="space-y-1">
          <h2 className="text-xl">Create your first quiz</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Start with a draft. Nobody can play it until you publish.
          </p>
        </div>
        <Link
          href="/my-quizzes/new"
          className={buttonVariants({
            size: "lg",
            className: "shadow-primary",
          })}>
          <PlusIcon />
          New quiz
        </Link>
      </div>
    );
  }

  const counts: Record<MyQuizStatus, number> = {
    PUBLISHED: 0,
    DRAFT: 0,
    ARCHIVED: 0,
    SUSPENDED: 0,
  };
  for (const quiz of quizzes) counts[quiz.status] += 1;

  const status = filterStatus(filter);
  const visible = status
    ? quizzes.filter((quiz) => quiz.status === status)
    : quizzes;

  return (
    <div className="space-y-8">
      <CreatorSummary summary={summary} />

      <div className="space-y-5">
        <QuizTabs active={filter} counts={counts} total={quizzes.length} />

        {visible.length > 0 ? (
          <ul className="space-y-4">
            {visible.map((quiz) => (
              <QuizRow key={quiz.slug} quiz={quiz} />
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed px-6 py-14 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-muted">
              <SearchXIcon
                aria-hidden
                className="size-6 text-muted-foreground"
              />
            </span>
            <p className="font-medium">
              No {filterLabel(filter).toLowerCase()} quizzes
            </p>
            <Link
              href="/my-quizzes"
              className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
              Show all quizzes
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
