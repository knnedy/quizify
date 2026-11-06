"use client";

import { useState } from "react";
import { CircleCheckIcon, InboxIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { FilterTabs } from "../../_components/filter-tabs";
import { SplitPane } from "../../_components/split-pane";
import { useTriageHotkeys } from "../_hooks/use-triage-hotkeys";
import type { Application, ApplicationStatus } from "../mock-data";
import { ApplicationDetail, type DetailDecision } from "./application-detail";
import { ApplicationList, type ListRow } from "./application-list";
import { QueueStats } from "./queue-stats";
import { RejectDialog } from "./reject-dialog";

type Tab = "pending" | "approved" | "rejected";
type Outcome = { status: "APPROVED" } | { status: "REJECTED"; reason: string };

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

// Pending goes oldest first so nobody waits at the bottom of the queue.
// Decided ones show the most recent decision first.
function sortRows(rows: ListRow[], status: ApplicationStatus) {
  return rows
    .filter((row) => row.status === status)
    .sort((a, b) => {
      if (status === "PENDING") {
        return b.application.waitingDays - a.application.waitingDays;
      }
      if (a.justNow !== b.justNow) return a.justNow ? -1 : 1;

      const when = (row: ListRow) =>
        Date.parse(
          row.application.decision?.reviewedAt ?? row.application.submittedAt,
        );
      return when(b) - when(a);
    });
}

export function ApplicationsWorkspace({
  applications,
}: {
  applications: Application[];
}) {
  const [tab, setTab] = useState<Tab>("pending");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [outcomes, setOutcomes] = useState<Record<number, Outcome>>({});
  const [rejecting, setRejecting] = useState(false);

  const rows: ListRow[] = applications.map((application) => ({
    application,
    status: outcomes[application.id]?.status ?? application.status,
    justNow: application.id in outcomes,
  }));

  const counts: Record<ApplicationStatus, number> = {
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0,
  };
  for (const row of rows) counts[row.status] += 1;

  const activeStatus =
    tabs.find((item) => item.value === tab)?.status ?? "PENDING";
  const pending = sortRows(rows, "PENDING");
  const list = sortRows(rows, activeStatus);
  const selected =
    list.find((row) => row.application.id === selectedId) ?? list[0] ?? null;

  const longestWait =
    pending.length > 0
      ? Math.max(...pending.map((row) => row.application.waitingDays))
      : null;

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
      ? list.findIndex((row) => row.application.id === selected.application.id)
      : 0;
    const next =
      list[Math.min(Math.max(index + direction, 0), list.length - 1)];
    setSelectedId(next.application.id);
  }

  function advance(id: number) {
    const index = pending.findIndex((row) => row.application.id === id);
    const next = pending[index + 1] ?? pending[index - 1] ?? null;

    setSelectedId(next ? next.application.id : null);
    setMobileOpen(next !== null);
  }

  function undo(id: number) {
    setOutcomes((previous) => {
      const next = { ...previous };
      delete next[id];
      return next;
    });
    setTab("pending");
    setSelectedId(id);
    setMobileOpen(true);
  }

  function decide(outcome: Outcome) {
    if (!selected || selected.status !== "PENDING") return;

    const { id, applicant } = selected.application;
    const firstName = applicant.name.split(" ")[0];

    advance(id);
    setOutcomes((previous) => ({ ...previous, [id]: outcome }));

    // Mock only: the real action saves the decision and refreshes the queue.
    toast.success(
      outcome.status === "APPROVED"
        ? `${firstName} is now a creator`
        : `Rejected. ${firstName} will see your message.`,
      { action: { label: "Undo", onClick: () => undo(id) } },
    );
  }

  function approve() {
    if (detailVisible()) decide({ status: "APPROVED" });
  }

  function startReject() {
    if (selected?.status === "PENDING" && detailVisible()) setRejecting(true);
  }

  function reject(reason: string) {
    setRejecting(false);
    decide({ status: "REJECTED", reason });
  }

  useTriageHotkeys({
    enabled: !rejecting,
    onNext: () => step(1),
    onPrevious: () => step(-1),
    onApprove: approve,
    onReject: startReject,
  });

  let decision: DetailDecision | null = null;
  if (selected && selected.status !== "PENDING") {
    const outcome = outcomes[selected.application.id];
    const saved = selected.application.decision;

    if (outcome) {
      decision = {
        by: "you",
        at: null,
        reason: outcome.status === "REJECTED" ? outcome.reason : null,
      };
    } else if (saved) {
      decision = {
        by: saved.reviewedBy,
        at: saved.reviewedAt,
        reason: saved.reason,
      };
    }
  }

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
        <QueueStats
          waiting={counts.PENDING}
          longestWait={longestWait}
          approved={counts.APPROVED}
          rejected={counts.REJECTED}
        />
      </div>

      {selected ? (
        <SplitPane
          showDetail={mobileOpen}
          list={
            <ApplicationList
              rows={list}
              activeId={selected.application.id}
              onSelect={select}
            />
          }
          detail={
            <ApplicationDetail
              key={selected.application.id}
              application={selected.application}
              status={selected.status}
              decision={decision}
              onApprove={() => decide({ status: "APPROVED" })}
              onReject={() => setRejecting(true)}
              onUndo={
                selected.application.id in outcomes
                  ? () => undo(selected.application.id)
                  : undefined
              }
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
          name={selected.application.applicant.name}
          onReject={reject}
        />
      )}
    </div>
  );
}
