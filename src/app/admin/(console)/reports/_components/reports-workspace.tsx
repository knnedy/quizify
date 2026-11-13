"use client";

import { useState, useTransition } from "react";
import { CircleCheckIcon, InboxIcon } from "lucide-react";
import { toast } from "sonner";
import { canSuspendQuiz, oldestDays } from "@/lib/admin-reports";
import { cn } from "@/lib/utils";
import {
  deleteReported,
  dismissReports,
  suspendReported,
} from "@/server/actions/admin-reports";
import type { ReportedQuiz } from "@/types/admin-reports";
import { ConfirmDialog } from "../../_components/confirm-dialog";
import { FilterTabs } from "../../_components/filter-tabs";
import { SplitPane } from "../../_components/split-pane";
import { StatStrip } from "../../_components/stat-strip";
import { SuspendDialog } from "../../_components/suspend-dialog";
import { useKeyMap } from "../../_hooks/use-key-map";
import { ReportDetail } from "./report-detail";
import { ReportList } from "./report-list";

type Tab = "open" | "resolved";

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

export function ReportsWorkspace({
  open,
  resolved,
  counts,
}: {
  open: ReportedQuiz[];
  resolved: ReportedQuiz[];
  counts: { open: number; resolved: number };
}) {
  const [tab, setTab] = useState<Tab>("open");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dismissing, setDismissing] = useState(false);
  const [suspending, setSuspending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isPending, startTransition] = useTransition();

  const list = tab === "open" ? open : resolved;
  const selected =
    list.find((item) => item.id === selectedId) ?? list[0] ?? null;

  const hiddenNow = open.filter(
    (item) => item.visibility === "HIDDEN_AUTO",
  ).length;
  const oldest =
    open.length > 0 ? Math.max(...open.map((item) => oldestDays(item))) : null;

  const tabOptions: { value: Tab; label: string; count: number }[] = [
    { value: "open", label: "Open", count: counts.open },
    { value: "resolved", label: "Resolved", count: counts.resolved },
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
      ? list.findIndex((item) => item.id === selected.id)
      : 0;
    const next =
      list[Math.min(Math.max(index + direction, 0), list.length - 1)];
    if (next) setSelectedId(next.id);
  }

  // The one that comes after the quiz being decided
  function neighbourOf(id: number) {
    const index = open.findIndex((item) => item.id === id);
    return open[index + 1] ?? open[index - 1] ?? null;
  }

  function moveTo(next: ReportedQuiz | null) {
    setSelectedId(next ? next.id : null);
    setMobileOpen(next !== null);
  }

  function actionable() {
    return selected !== null && selected.status === "OPEN" && !isPending;
  }

  function dismiss() {
    if (!selected || !actionable()) return;

    const { id, quiz } = selected;
    const next = neighbourOf(id);

    startTransition(async () => {
      const result = await dismissReports({ quizId: id });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      setDismissing(false);
      toast.success(
        result.restored ? `${quiz.title} is live again` : "Reports dismissed",
      );
      moveTo(next);
    });
  }

  // Dismissing a quiz that was hidden automatically makes it live again, so
  // that one asks first
  function startDismiss() {
    if (!selected || !actionable()) return;

    if (selected.visibility === "HIDDEN_AUTO") setDismissing(true);
    else dismiss();
  }

  function suspend(message: string) {
    if (!selected || !actionable()) return;

    const { id, quiz } = selected;
    const next = neighbourOf(id);

    startTransition(async () => {
      const result = await suspendReported({ quizId: id, message });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      setSuspending(false);
      toast.success(`${quiz.title} was suspended`);
      moveTo(next);
    });
  }

  function remove() {
    if (!selected || !actionable()) return;

    const { id, quiz } = selected;
    const next = neighbourOf(id);

    startTransition(async () => {
      const result = await deleteReported({ quizId: id });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      setDeleting(false);
      toast.success(`${quiz.title} was deleted`);
      moveTo(next);
    });
  }

  function startSuspend() {
    if (
      selected &&
      actionable() &&
      canSuspendQuiz(selected.visibility) &&
      detailVisible()
    ) {
      setSuspending(true);
    }
  }

  useKeyMap(!dismissing && !suspending && !deleting && !isPending, {
    j: () => step(1),
    k: () => step(-1),
    d: () => {
      if (detailVisible()) startDismiss();
    },
    s: startSuspend,
  });

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
            { label: "Open", value: String(counts.open) },
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
            <ReportList items={list} activeId={selected.id} onSelect={select} />
          }
          detail={
            <ReportDetail
              key={`${tab}-${selected.id}`}
              item={selected}
              busy={isPending}
              onDismiss={startDismiss}
              onSuspend={() => setSuspending(true)}
              onDelete={() => setDeleting(true)}
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
          <ConfirmDialog
            open={dismissing}
            onOpenChange={setDismissing}
            title={`Dismiss the reports on ${selected.quiz.title}?`}
            description="The quiz was hidden automatically after several reports. Dismissing them makes it live again for everyone."
            confirmLabel="Dismiss and restore"
            pending={isPending}
            onConfirm={dismiss}
          />
          <SuspendDialog
            open={suspending}
            onOpenChange={setSuspending}
            title={selected.quiz.title}
            pending={isPending}
            onSuspend={suspend}
          />
          <ConfirmDialog
            open={deleting}
            onOpenChange={setDeleting}
            title={`Delete ${selected.quiz.title}?`}
            description="It is removed for everyone. Players' past results are kept, and this can't be undone from here."
            confirmLabel="Delete quiz"
            destructive
            pending={isPending}
            onConfirm={remove}
          />
        </>
      )}
    </div>
  );
}
