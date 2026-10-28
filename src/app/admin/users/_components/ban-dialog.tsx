"use client";

import { useId, useState, type FormEvent } from "react";
import { Segmented } from "@/components/quiz-editor/segmented";
import { SwitchRow } from "@/components/quiz-editor/switch-row";
import { FormBlock } from "@/components/quiz-editor/form-block";
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

export type BanInput = {
  reason: string;
  days: number | null;
  hideQuizzes: boolean;
};

const MIN_LENGTH = 10;
const MAX_LENGTH = 300;

const presets = [
  {
    label: "Spam",
    text: "Posting spam or promoting products and websites.",
  },
  {
    label: "Harassment",
    text: "Harassing or targeting other players.",
  },
  {
    label: "Inappropriate content",
    text: "Publishing sexual, hateful or otherwise inappropriate content.",
  },
  {
    label: "Cheating",
    text: "Abusing Quizify to get XP or leaderboard places unfairly.",
  },
];

const durations: { value: number | null; label: string }[] = [
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: null, label: "Permanent" },
];

// Mounts with the dialog, so every time it opens the form starts fresh.
function BanForm({
  name,
  published,
  onBan,
}: {
  name: string;
  published: number;
  onBan: (input: BanInput) => void;
}) {
  const textId = useId();
  const [reason, setReason] = useState("");
  const [days, setDays] = useState<number | null>(7);
  const [hideQuizzes, setHideQuizzes] = useState(false);

  const trimmed = reason.trim();
  const valid = trimmed.length >= MIN_LENGTH;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!valid) return;

    onBan({ reason: trimmed, days, hideQuizzes: published > 0 && hideQuizzes });
  }

  return (
    <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
      <DialogHeader className="shrink-0 gap-1.5 p-5 pr-12">
        <DialogTitle className="text-xl">Ban {name}?</DialogTitle>
        <DialogDescription>
          They are signed out right away. If they try to sign in, they see your
          message.
        </DialogDescription>
      </DialogHeader>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 pb-5">
        <FormBlock label="Quick reasons">
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
        </FormBlock>

        <FormBlock
          label="Message to the user"
          htmlFor={textId}
          hint={`At least ${MIN_LENGTH} characters.`}>
          <textarea
            id={textId}
            rows={3}
            value={reason}
            maxLength={MAX_LENGTH}
            placeholder="Say what they did and what would need to change."
            onChange={(event) => setReason(event.target.value)}
            className="w-full resize-y rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-ring/40"
          />
          <p className="text-right text-xs text-muted-foreground tabular-nums">
            {reason.length}/{MAX_LENGTH}
          </p>
        </FormBlock>

        <FormBlock label="Ban length">
          <Segmented<number | null>
            label="Ban length"
            value={days}
            options={durations}
            onChange={setDays}
          />
        </FormBlock>

        {published > 0 && (
          <SwitchRow
            label="Hide their published quizzes"
            description={`${published} ${published === 1 ? "quiz disappears" : "quizzes disappear"} from browse and search while they are banned.`}
            checked={hideQuizzes}
            onCheckedChange={setHideQuizzes}
          />
        )}
      </div>

      <DialogFooter className="mx-0 mb-0 shrink-0 px-5 py-4">
        <DialogClose render={<Button type="button" variant="outline" />}>
          Cancel
        </DialogClose>
        <Button type="submit" variant="destructive" disabled={!valid}>
          Ban user
        </Button>
      </DialogFooter>
    </form>
  );
}

export function BanDialog({
  open,
  onOpenChange,
  name,
  publishedQuizzes,
  onBan,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  publishedQuizzes: number;
  onBan: (input: BanInput) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <BanForm name={name} published={publishedQuizzes} onBan={onBan} />
      </DialogContent>
    </Dialog>
  );
}
