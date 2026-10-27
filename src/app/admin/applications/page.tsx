import type { Metadata } from "next";
import { CircleCheckIcon, InboxIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ApplicationDetail } from "./_components/application-detail";
import { ApplicationList } from "./_components/application-list";
import {
  ApplicationTabs,
  applicationsHref,
  filterToStatus,
  parseFilter,
  type ApplicationFilter,
} from "./_components/application-tabs";
import { getApplications } from "./mock-data";

export const metadata: Metadata = { title: "Creator applications" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const emptyCopy: Record<ApplicationFilter, { title: string; text: string }> = {
  pending: {
    title: "You're all caught up",
    text: "There are no applications waiting for review.",
  },
  approved: {
    title: "No approved applications yet",
    text: "Creators you approve will show up here.",
  },
  rejected: {
    title: "No rejected applications",
    text: "Applications you turn down will show up here.",
  },
};

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const raw = await searchParams;
  const filter = parseFilter(first(raw.status));
  const { items, counts } = await getApplications({
    status: filterToStatus(filter),
  });

  const requestedId = Number.parseInt(first(raw.id) ?? "", 10);
  const requested = items.find((item) => item.id === requestedId) ?? null;
  const detail = requested ?? items[0] ?? null;
  const Icon = filter === "pending" ? CircleCheckIcon : InboxIcon;

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-6 py-8 sm:py-10">
      <header className="space-y-2">
        <h1 className="text-3xl sm:text-4xl">Creator applications</h1>
        <p className="max-w-prose text-muted-foreground">
          Read each answer and decide who can publish quizzes. The oldest
          applications are at the top.
        </p>
      </header>

      <ApplicationTabs active={filter} counts={counts} />

      {detail ? (
        <div className="grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-start">
          <div className={cn(requested && "hidden lg:block")}>
            <ApplicationList
              items={items}
              activeId={detail.id}
              filter={filter}
            />
          </div>

          <div
            className={cn(
              "lg:sticky lg:top-6",
              !requested && "hidden lg:block",
            )}>
            <ApplicationDetail
              key={detail.id}
              application={detail}
              backHref={applicationsHref(filter)}
            />
          </div>
        </div>
      ) : (
        <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-2xl border border-dashed px-6 py-16 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Icon aria-hidden className="size-6" />
          </span>
          <div className="space-y-1">
            <h2 className="text-xl">{emptyCopy[filter].title}</h2>
            <p className="text-sm text-muted-foreground">
              {emptyCopy[filter].text}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
