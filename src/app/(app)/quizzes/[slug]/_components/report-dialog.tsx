"use client";

import { useId, useState, type FormEvent } from "react";
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
import { reportQuiz } from "@/server/actions/reports";

export function ReportDialog({
  slug,
  title,
  alreadyReported,
}: {
  slug: string;
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

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reason || sending) return;

    setSending(true);
    try {
      const result = await reportQuiz({ slug, reason, details });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      setReported(true);
      setOpen(false);
      toast.success("Report sent. Thank you for helping keep Quizify safe.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
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

      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <DialogHeader className="shrink-0 gap-1.5 p-5 pr-12">
            <DialogTitle className="text-xl">Report this quiz</DialogTitle>
            <DialogDescription>
              What is wrong with {title}? Reports are anonymous to the creator
              and an admin reviews every one.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 pb-5">
            <div className="space-y-3">
              <div
                role="radiogroup"
                aria-label="Reason for reporting"
                className="grid gap-2 sm:grid-cols-2">
                {reportReasons.map((value) => {
                  const active = reason === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setReason(value)}
                      className={cn(
                        "flex min-h-12 items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                        active
                          ? "border-primary bg-primary-soft"
                          : "bg-card hover:border-foreground/25 hover:bg-muted/60",
                      )}>
                      <span
                        aria-hidden
                        className={cn(
                          "flex size-4.5 shrink-0 items-center justify-center rounded-full border transition-colors",
                          active ? "border-primary bg-primary" : "border-input",
                        )}>
                        {active && (
                          <span className="size-1.5 rounded-full bg-primary-foreground" />
                        )}
                      </span>
                      {reportReasonInfo[value].label}
                    </button>
                  );
                })}
              </div>

              <p
                aria-live="polite"
                className="min-h-5 text-sm text-muted-foreground">
                {reason
                  ? reportReasonInfo[reason].description
                  : "Pick the closest match."}
              </p>
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
          </div>

          <DialogFooter className="mx-0 mb-0 shrink-0 px-5 py-4">
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
