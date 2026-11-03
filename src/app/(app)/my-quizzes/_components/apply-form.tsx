"use client";

import { useState, useTransition, type SubmitEvent } from "react";
import { SendIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  APPLICATION_MAX_LENGTH,
  APPLICATION_MIN_LENGTH,
} from "@/lib/creator-rules";
import { cn } from "@/lib/utils";
import { applyToCreate } from "@/server/actions/creator-applications";

export function ApplyForm() {
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();

  const length = text.trim().length;
  const valid =
    length >= APPLICATION_MIN_LENGTH && length <= APPLICATION_MAX_LENGTH;

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!valid || isPending) return;

    // On success the page refreshes into the pending state
    startTransition(async () => {
      const result = await applyToCreate({ motivation: text });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success("Application sent");
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="motivation" className="text-sm font-medium">
          What would you like to create?
        </label>
        <textarea
          id="motivation"
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={5}
          maxLength={APPLICATION_MAX_LENGTH}
          placeholder="Tell us the topics you have in mind and why you know them well."
          className="min-h-32 w-full resize-y rounded-xl border border-input bg-card px-4 py-3 text-base shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-ring/40"
        />
        <p className="flex justify-between gap-3 text-xs text-muted-foreground tabular-nums">
          <span>At least {APPLICATION_MIN_LENGTH} characters</span>
          <span
            className={cn(
              length >= APPLICATION_MAX_LENGTH && "text-incorrect-ink",
            )}>
            {length}/{APPLICATION_MAX_LENGTH}
          </span>
        </p>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full shadow-primary"
        disabled={!valid || isPending}>
        {isPending ? <Spinner /> : <SendIcon />}
        Send application
      </Button>
    </form>
  );
}
