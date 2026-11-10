"use client";

import { useState, useTransition } from "react";
import { CircleCheckIcon, InboxIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  approveApplication,
  rejectApplication,
} from "@/server/actions/admin-applications";
import type {
  Application,
  ApplicationStatus,
} from "@/types/admin-applications";
import { FilterTabs } from "../../_components/filter-tabs";
import { SplitPane } from "../../_components/split-pane";
import { StatStrip } from "../../_components/stat-strip";
import { useKeyMap } from "../../_hooks/use-key-map";
import { ApplicationDetail } from "./application-detail";
import { ApplicationList } from "./application-list";
import { RejectDialog } from "./reject-dialog";

type Tab = "pending" | "approved" | "rejected";

const tabs: { value: Tab; label: string; status: ApplicationStatus }[] = [
  { value: "pending", label: "Pending", status: "PENDING" },
  { value: "approved", label: "Approved", status: "APPROVED" },
  { value: "rejected", label: "Rejected", status: "REJECTED" },
];

const emptyCopy: Record<Tab, { title: string; text: string }> = {
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

function firstName(name: string) {
  return name.split(" ")[0] ?? name;
}

export function ApplicationsWorkspace({
  applications,
  counts,
}: {
  applications: Application[];
  counts: Record<ApplicationStatus, number>;
}) {
  const [tab, setTab] = useState<Tab>("pending");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [isPending, startTransition] = useTransition();

  const activeStatus =
    tabs.find((item) => item.value === tab)?.status ?? "PENDING";
  const waiting = applications.filter((item) => item.status === "PENDING");
  const list = applications.filter((item) => item.status === activeStatus);
  const selected =
    list.find((item) => item.id === selectedId) ?? list[0] ?? null;

  const longestWait =
    waiting.length > 0
      ? Math.max(...waiting.map((item) => item.waitingDays))
      : null;

  const decided = counts.APPROVED + counts.REJECTED;
  const rate =
    decided > 0 ? Math.round((counts.APPROVED / decided) * 100) : null;
  const wait =
    longestWait === null
      ? "None"
      : longestWait === 0
        ? "Today"
        : `${longestWait} ${longestWait === 1 ? "day" : "days"}`;

  const tabOptions = tabs.map((item) => ({
    value: item.value,
    label: item.label,
    count: counts[item.status],
  }));

  // On a phone the list and the detail take turns, so the keys only act on
  // what is actually on screen.
  function detailVisible() {
    return mobileOpen || window.matchMedia("(min-width: 1024px)").matches;
  }

  function select(id: number) {
    setSelectedId(id);
    setMobileOpen(true);
  }

  function changeTab(next: Tab) {
    setTab(next);
    setSelectedId(null);
    setMobileOpen(false);
  }

  function step(direction: 1 | -1) {
    if (list.length === 0) return;

    const index = selected
      ? list.findIndex((item) => item.id === selected.id)
      : 0;
    const next =
      list[Math.min(Math.max(index + direction, 0), list.length - 1)];
    if (next) setSelectedId(next.id);
  }

  // The one that comes after the application being decided
  function neighbourOf(id: number) {
    const index = waiting.findIndex((item) => item.id === id);
    return waiting[index + 1] ?? waiting[index - 1] ?? null;
  }

  function moveTo(next: Application | null) {
    setSelectedId(next ? next.id : null);
    setMobileOpen(next !== null);
  }

  function approve() {
    if (!selected || selected.status !== "PENDING" || isPending) return;

    const { id, applicant } = selected;
    const next = neighbourOf(id);

    startTransition(async () => {
      const result = await approveApplication({ applicationId: id });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success(`${firstName(applicant.name)} is now a creator`);
      moveTo(next);
    });
  }

  function reject(reason: string) {
    if (!selected || selected.status !== "PENDING" || isPending) return;

    const { id, applicant } = selected;
    const next = neighbourOf(id);

    startTransition(async () => {
      const result = await rejectApplication({ applicationId: id, reason });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      setRejecting(false);
      toast.success(
        `Rejected. ${firstName(applicant.name)} will see your message.`,
      );
      moveTo(next);
    });
  }

  function startReject() {
    if (selected?.status === "PENDING" && detailVisible()) setRejecting(true);
  }

  useKeyMap(!rejecting && !isPending, {
    j: () => step(1),
    k: () => step(-1),
    a: () => {
      if (detailVisible()) approve();
    },
    r: startReject,
  });

  const EmptyIcon = tab === "pending" ? CircleCheckIcon : InboxIcon;

  return (
    <div className="flex flex-col gap-5 lg:min-h-0 lg:flex-1">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <FilterTabs
          label="Filter by status"
          value={tab}
          options={tabOptions}
          onChange={changeTab}
        />
        <StatStrip
          stats={[
            { label: "Waiting", value: String(counts.PENDING) },
            {
              label: "Longest wait",
              value: wait,
              warn: longestWait !== null && longestWait >= 5,
            },
            {
              label: "Approval rate",
              value: rate === null ? "None yet" : `${rate}%`,
              hint: `${counts.APPROVED} approved, ${counts.REJECTED} rejected`,
            },
          ]}
        />
      </div>

      {selected ? (
        <SplitPane
          showDetail={mobileOpen}
          list={
            <ApplicationList
              applications={list}
              activeId={selected.id}
              onSelect={select}
            />
          }
          detail={
            <ApplicationDetail
              key={selected.id}
              application={selected}
              busy={isPending}
              onApprove={approve}
              onReject={() => setRejecting(true)}
              onBack={() => setMobileOpen(false)}
            />
          }
        />
      ) : (
        <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-2xl border border-dashed px-6 py-16 text-center">
          <span
            className={cn(
              "flex size-14 items-center justify-center rounded-full",
              tab === "pending"
                ? "animate-pop bg-correct-soft text-correct-ink"
                : "bg-muted text-muted-foreground",
            )}>
            <EmptyIcon aria-hidden className="size-7" />
          </span>
          <div className="space-y-1">
            <h2 className="text-xl">{emptyCopy[tab].title}</h2>
            <p className="text-sm text-muted-foreground">
              {emptyCopy[tab].text}
            </p>
          </div>
        </div>
      )}

      {selected && (
        <RejectDialog
          open={rejecting}
          onOpenChange={setRejecting}
          name={selected.applicant.name}
          pending={isPending}
          onReject={reject}
        />
      )}
    </div>
  );
}
