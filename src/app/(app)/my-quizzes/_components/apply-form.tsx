"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { SendIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

const MIN_LENGTH = 40;
const MAX_LENGTH = 500;

export function ApplyForm() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const length = text.trim().length;
  const valid = length >= MIN_LENGTH && length <= MAX_LENGTH;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!valid || sending) return;

    setSending(true);

    // Mock only: the real action saves the application and the page renders
    // the pending state on its own.
    window.setTimeout(() => {
      toast.success("Application sent");
      router.replace("/my-quizzes?as=pending");
    }, 700);
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
          maxLength={MAX_LENGTH}
          placeholder="Tell us the topics you have in mind and why you know them well."
          className="min-h-32 w-full resize-y rounded-xl border border-input bg-card px-4 py-3 text-base shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-ring/40"
        />
        <p className="flex justify-between gap-3 text-xs text-muted-foreground tabular-nums">
          <span>At least {MIN_LENGTH} characters</span>
          <span className={cn(length >= MAX_LENGTH && "text-incorrect-ink")}>
            {length}/{MAX_LENGTH}
          </span>
        </p>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full shadow-primary"
        disabled={!valid || sending}>
        {sending ? <Spinner /> : <SendIcon />}
        Send application
      </Button>
    </form>
  );
}
