"use client";

import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const MIN_LENGTH = 10;
const MAX_LENGTH = 300;

const presets = [
  {
    label: "Inappropriate content",
    text: "This quiz contains content that isn't suitable for Quizify, so it has been suspended.",
  },
  {
    label: "Copied content",
    text: "Parts of this quiz are copied from someone else's work, so it has been suspended.",
  },
  {
    label: "Misleading answers",
    text: "Some answers in this quiz are incorrect or misleading. Correct them before it can be restored.",
  },
  {
    label: "Spam",
    text: "This quiz is promotional, so it has been suspended.",
  },
];

// Mounts with the dialog, so every time it opens the message starts empty.
function SuspendForm({
  title,
  onSuspend,
}: {
  title: string;
  onSuspend: (message: string) => void;
}) {
  const textId = useId();
  const [message, setMessage] = useState("");

  const trimmed = message.trim();
  const valid = trimmed.length >= MIN_LENGTH;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (valid) onSuspend(trimmed);
  }

  return (
    <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
      <DialogHeader className="shrink-0 gap-1.5 p-5 pr-12">
        <DialogTitle className="text-xl leading-snug">
          Suspend {title}?
        </DialogTitle>
        <DialogDescription>
          The creator sees your message on My quizzes. The quiz stays hidden
          from everyone until an admin restores it.
        </DialogDescription>
      </DialogHeader>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 pb-5">
        <div className="space-y-2.5">
          <p className="text-sm font-medium">Quick reasons</p>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => {
              const active = message === preset.text;

              return (
                <button
                  key={preset.label}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setMessage(preset.text)}
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
            Message to the creator
          </label>
          <textarea
            id={textId}
            rows={4}
            value={message}
            maxLength={MAX_LENGTH}
            placeholder="Say what needs to change before it can be restored."
            onChange={(event) => setMessage(event.target.value)}
            className="w-full resize-y rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-ring/40"
          />
          <p className="flex justify-between gap-3 text-xs text-muted-foreground tabular-nums">
            <span>At least {MIN_LENGTH} characters</span>
            <span>
              {message.length}/{MAX_LENGTH}
            </span>
          </p>
        </div>
      </div>

      <DialogFooter className="mx-0 mb-0 shrink-0 px-5 py-4">
        <DialogClose render={<Button type="button" variant="outline" />}>
          Cancel
        </DialogClose>
        <Button type="submit" disabled={!valid}>
          Suspend quiz
        </Button>
      </DialogFooter>
    </form>
  );
}

export function SuspendDialog({
  open,
  onOpenChange,
  title,
  onSuspend,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onSuspend: (message: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <SuspendForm title={title} onSuspend={onSuspend} />
      </DialogContent>
    </Dialog>
  );
}
