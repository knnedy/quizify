"use client";

import { useState } from "react";
import { CircleCheckIcon, InboxIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "../../_components/confirm-dialog";
import { FilterTabs } from "../../_components/filter-tabs";
import { SplitPane } from "../../_components/split-pane";
import { StatStrip } from "../../_components/stat-strip";
import { SuspendDialog } from "../../_components/suspend-dialog";
import { useKeyMap } from "../../_hooks/use-key-map";
import type { ReportedQuiz, ReportStatus } from "../mock-data";
import { isSerious } from "./reason-chip";
import { ReportDetail, type DetailDecision } from "./report-detail";
import { ReportList, type ListRow } from "./report-list";
import { oldestDays } from "./report-time";

type Tab = "open" | "resolved";
type Outcome =
  | { status: "DISMISSED" }
  | { status: "SUSPENDED"; message: string }
  | { status: "DELETED" };

const emptyCopy: Record<Tab, { title: string; text: string }> = {
  open: {
    title: "Nothing to review",
    text: "There are no reported quizzes waiting for a decision.",
  },
  resolved: {
    title: "No decisions yet",
    text: "Reports you have dismissed or acted on will show up here.",
  },
};

function hasSerious(item: ReportedQuiz) {
  return item.reports.some((report) => isSerious(report.reason));
}

// Serious reasons first, then the most reports, then the longest wait.
function compareOpen(a: ListRow, b: ListRow) {
  return (
    Number(hasSerious(b.item)) - Number(hasSerious(a.item)) ||
    b.item.reports.length - a.item.reports.length ||
    oldestDays(b.item) - oldestDays(a.item)
  );
}

function decidedAt(row: ListRow) {
  return row.item.decision ? Date.parse(row.item.decision.at) : 0;
}

function compareResolved(a: ListRow, b: ListRow) {
  if (a.justNow !== b.justNow) return a.justNow ? -1 : 1;
  return decidedAt(b) - decidedAt(a);
}

export function ReportsWorkspace({ items }: { items: ReportedQuiz[] }) {
  const [tab, setTab] = useState<Tab>("open");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [outcomes, setOutcomes] = useState<Record<number, Outcome>>({});
  const [suspending, setSuspending] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const rows: ListRow[] = items.map((item) => ({
    item,
    status: outcomes[item.id]?.status ?? item.status,
    justNow: item.id in outcomes,
  }));

  const openRows = rows
    .filter((row) => row.status === "OPEN")
    .sort(compareOpen);
  const resolvedRows = rows
    .filter((row) => row.status !== "OPEN")
    .sort(compareResolved);

  const list = tab === "open" ? openRows : resolvedRows;
  const selected =
    list.find((row) => row.item.id === selectedId) ?? list[0] ?? null;

  const hiddenNow = openRows.filter(
    (row) => row.item.hiddenAutomatically,
  ).length;
  const oldest =
    openRows.length > 0
      ? Math.max(...openRows.map((row) => oldestDays(row.item)))
      : null;

  const tabOptions: { value: Tab; label: string; count: number }[] = [
    { value: "open", label: "Open", count: openRows.length },
    { value: "resolved", label: "Resolved", count: resolvedRows.length },
  ];

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
      ? list.findIndex((row) => row.item.id === selected.item.id)
      : 0;
    const next =
      list[Math.min(Math.max(index + direction, 0), list.length - 1)];
    setSelectedId(next.item.id);
  }

  function advance(id: number) {
    const index = openRows.findIndex((row) => row.item.id === id);
    const next = openRows[index + 1] ?? openRows[index - 1] ?? null;

    setSelectedId(next ? next.item.id : null);
    setMobileOpen(next !== null);
  }

  function undo(id: number) {
    setOutcomes((previous) => {
      const next = { ...previous };
      delete next[id];
      return next;
    });
    setTab("open");
    setSelectedId(id);
    setMobileOpen(true);
  }

  function decide(outcome: Outcome) {
    if (!selected || selected.status !== "OPEN") return;

    const { id, quiz, hiddenAutomatically } = selected.item;
    advance(id);
    setOutcomes((previous) => ({ ...previous, [id]: outcome }));

    let message: string;
    if (outcome.status === "DISMISSED") {
      message = hiddenAutomatically
        ? `${quiz.title} is live again`
        : "Report dismissed";
    } else if (outcome.status === "SUSPENDED") {
      message = `${quiz.title} was suspended`;
    } else {
      message = `${quiz.title} was deleted`;
    }

    // Mock only: the real actions save the decision and refresh the queue.
    toast.success(message, {
      action: { label: "Undo", onClick: () => undo(id) },
    });
  }

  function dismiss() {
    if (detailVisible()) decide({ status: "DISMISSED" });
  }

  function startSuspend() {
    if (selected?.status === "OPEN" && detailVisible()) setSuspending(true);
  }

  function suspend(message: string) {
    setSuspending(false);
    decide({ status: "SUSPENDED", message });
  }

  function remove() {
    setDeleting(false);
    decide({ status: "DELETED" });
  }

  useKeyMap(!suspending && !deleting, {
    j: () => step(1),
    k: () => step(-1),
    d: dismiss,
    s: startSuspend,
  });

  let decision: DetailDecision | null = null;
  if (selected && selected.status !== "OPEN") {
    const outcome = outcomes[selected.item.id];
    const saved = selected.item.decision;

    if (outcome) {
      decision = {
        by: "you",
        at: null,
        note: outcome.status === "SUSPENDED" ? outcome.message : null,
      };
    } else if (saved) {
      decision = { by: saved.by, at: saved.at, note: saved.note };
    }
  }

  const EmptyIcon = tab === "open" ? CircleCheckIcon : InboxIcon;

  return (
    <div className="flex flex-col gap-5 lg:min-h-0 lg:flex-1">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <FilterTabs
          label="Filter reports"
          value={tab}
          options={tabOptions}
          onChange={changeTab}
        />
        <StatStrip
          stats={[
            { label: "Open", value: String(openRows.length) },
            {
              label: "Hidden now",
              value: String(hiddenNow),
              hint: "Hidden automatically while they wait for review",
              warn: hiddenNow > 0,
            },
            {
              label: "Oldest report",
              value:
                oldest === null
                  ? "None"
                  : oldest === 0
                    ? "Today"
                    : `${oldest} ${oldest === 1 ? "day" : "days"}`,
              warn: oldest !== null && oldest >= 5,
            },
          ]}
        />
      </div>

      {selected ? (
        <SplitPane
          showDetail={mobileOpen}
          list={
            <ReportList
              rows={list}
              activeId={selected.item.id}
              onSelect={select}
            />
          }
          detail={
            <ReportDetail
              key={selected.item.id}
              item={selected.item}
              status={selected.status}
              decision={decision}
              onDismiss={() => decide({ status: "DISMISSED" })}
              onSuspend={() => setSuspending(true)}
              onDelete={() => setDeleting(true)}
              onUndo={
                selected.item.id in outcomes
                  ? () => undo(selected.item.id)
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
              tab === "open"
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
        <>
          <SuspendDialog
            open={suspending}
            onOpenChange={setSuspending}
            title={selected.item.quiz.title}
            onSuspend={suspend}
          />
          <ConfirmDialog
            open={deleting}
            onOpenChange={setDeleting}
            title={`Delete ${selected.item.quiz.title}?`}
            description="It is removed for everyone and the creator is told. Players' past results are kept, and you can undo it right after."
            confirmLabel="Delete quiz"
            destructive
            onConfirm={remove}
          />
        </>
      )}
    </div>
  );
}
