"use client";

import { useId, useState } from "react";
import { CheckIcon, FlagIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import {
  reportDetailsMax,
  reportReasonInfo,
  reportReasons,
  type ReportReason,
} from "@/lib/report-reasons";
import { cn } from "@/lib/utils";

export function ReportDialog({
  title,
  alreadyReported,
}: {
  title: string;
  alreadyReported: boolean;
}) {
  const detailsId = useId();
  const [open, setOpen] = useState(false);
  const [reported, setReported] = useState(alreadyReported);
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState("");
  const [sending, setSending] = useState(false);

  function onOpenChange(next: boolean) {
    if (sending) return;
    setOpen(next);

    if (next) {
      setReason(null);
      setDetails("");
    }
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reason || sending) return;

    setSending(true);

    // Mock only: the real action saves one report per user per quiz.
    window.setTimeout(() => {
      setSending(false);
      setReported(true);
      setOpen(false);
      toast.success("Report sent. Thank you for helping keep Quizify safe.");
    }, 700);
  }

  if (reported) {
    return (
      <span className="inline-flex h-8 items-center gap-1.5 px-2.5 text-sm font-medium text-muted-foreground">
        <CheckIcon aria-hidden className="size-4" />
        Reported
      </span>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring">
        <FlagIcon aria-hidden className="size-4" />
        <span className="hidden sm:inline">Report</span>
        <span className="sr-only sm:hidden">Report this quiz</span>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit} className="grid gap-5">
          <DialogHeader>
            <DialogTitle className="text-xl">Report this quiz</DialogTitle>
            <DialogDescription>
              What is wrong with {title}? Reports are anonymous to the creator
              and an admin reviews every one.
            </DialogDescription>
          </DialogHeader>

          <div
            role="radiogroup"
            aria-label="Reason for reporting"
            className="grid gap-2">
            {reportReasons.map((value) => {
              const info = reportReasonInfo[value];
              const active = reason === value;

              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setReason(value)}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    active
                      ? "border-primary bg-primary-soft"
                      : "bg-card hover:border-foreground/25 hover:bg-muted/60",
                  )}>
                  <span
                    aria-hidden
                    className={cn(
                      "mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full border transition-colors",
                      active ? "border-primary bg-primary" : "border-input",
                    )}>
                    {active && (
                      <span className="size-1.5 rounded-full bg-primary-foreground" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">
                      {info.label}
                    </span>
                    <span className="block text-sm text-muted-foreground">
                      {info.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="space-y-2">
            <label htmlFor={detailsId} className="block text-sm font-medium">
              Details{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </label>
            <textarea
              id={detailsId}
              rows={3}
              value={details}
              maxLength={reportDetailsMax}
              placeholder="Which question or answer is the problem?"
              onChange={(event) => setDetails(event.target.value)}
              className="w-full resize-y rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-ring/40"
            />
            <p className="text-right text-xs text-muted-foreground tabular-nums">
              {details.length}/{reportDetailsMax}
            </p>
          </div>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={!reason || sending}>
              {sending && <Spinner />}
              Send report
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
