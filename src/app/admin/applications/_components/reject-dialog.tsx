"use client";

import { useId, useState, type FormEvent } from "react";
import { XIcon } from "lucide-react";
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
import { cn } from "@/lib/utils";

const MIN_LENGTH = 10;
const MAX_LENGTH = 300;

const presets = [
  {
    label: "Needs more detail",
    text: "Tell us which topics you plan to cover and why you know them well, then apply again.",
  },
  {
    label: "Play more first",
    text: "Play a few more quizzes first so you know what players enjoy, then apply again.",
  },
  {
    label: "Promotional",
    text: "Quizify isn't the place to promote products or websites, so we can't approve this one.",
  },
  {
    label: "Not a fit",
    text: "Your plans don't fit what Quizify is for right now, so we can't approve this one.",
  },
];

export function RejectDialog({
  name,
  onReject,
}: {
  name: string;
  onReject: (reason: string) => void;
}) {
  const textId = useId();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  const trimmed = reason.trim();
  const valid = trimmed.length >= MIN_LENGTH;

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (next) setReason("");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!valid) return;

    setOpen(false);
    onReject(trimmed);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={<Button variant="outline" size="lg" />}>
        <XIcon />
        Reject
      </DialogTrigger>

      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <DialogHeader className="shrink-0 gap-1.5 p-5 pr-12">
            <DialogTitle className="text-xl">Reject {name}?</DialogTitle>
            <DialogDescription>
              They will see your message on their My quizzes page, and they can
              apply again after 14 days.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 pb-5">
            <div className="space-y-2.5">
              <p className="text-sm font-medium">Quick reasons</p>
              <div className="flex flex-wrap gap-2">
                {presets.map((preset) => {
                  const active = reason === preset.text;

                  return (
                    <button
                      key={preset.label}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setReason(preset.text)}
                      className={cn(
                        "inline-flex h-8 items-center rounded-full border px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                        active
                          ? "border-primary bg-primary-soft text-primary"
                          : "bg-card text-muted-foreground hover:border-foreground/25 hover:text-foreground",
                      )}>
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor={textId} className="block text-sm font-medium">
                Message to the applicant
              </label>
              <textarea
                id={textId}
                rows={4}
                value={reason}
                maxLength={MAX_LENGTH}
                placeholder="Say what they could change before applying again."
                onChange={(event) => setReason(event.target.value)}
                className="w-full resize-y rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-ring/40"
              />
              <p className="flex justify-between gap-3 text-xs text-muted-foreground tabular-nums">
                <span>At least {MIN_LENGTH} characters</span>
                <span>
                  {reason.length}/{MAX_LENGTH}
                </span>
              </p>
            </div>
          </div>

          <DialogFooter className="mx-0 mb-0 shrink-0 px-5 py-4">
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit" variant="destructive" disabled={!valid}>
              Reject application
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
