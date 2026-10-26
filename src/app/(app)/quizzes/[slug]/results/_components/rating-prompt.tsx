"use client";

import { useState } from "react";
import { StarIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const labels = ["Poor", "Fair", "Good", "Great", "Excellent"];

export function RatingPrompt({ initial }: { initial: number | null }) {
  const [rating, setRating] = useState(initial);
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? rating ?? 0;

  function choose(value: number) {
    toast.success(rating === null ? "Thanks for rating" : "Rating updated");
    setRating(value);
  }

  return (
    <section
      aria-labelledby="rating-heading"
      className="flex flex-col gap-5 rounded-2xl border bg-card p-6 shadow-xs">
      <div className="space-y-1">
        <h2 id="rating-heading" className="text-xl">
          How was this quiz?
        </h2>
        <p className="text-sm text-muted-foreground">
          {rating === null
            ? "Ratings help other players find good quizzes."
            : "Thanks. Pick another star to change your rating."}
        </p>
      </div>

      <div
        role="group"
        aria-label="Rate this quiz"
        className="mt-auto space-y-3"
        onMouseLeave={() => setHover(null)}>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={rating === value}
              aria-label={`${value} ${value === 1 ? "star" : "stars"}`}
              onMouseEnter={() => setHover(value)}
              onClick={() => choose(value)}
              className="rounded-md p-0.5 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-95">
              <StarIcon
                className={cn(
                  "size-9 transition-colors",
                  value <= shown ? "fill-xp text-xp" : "text-border",
                )}
              />
            </button>
          ))}
        </div>
        <p className="h-5 text-sm font-medium text-muted-foreground">
          {shown > 0 ? labels[shown - 1] : "Tap a star to rate"}
        </p>
      </div>
    </section>
  );
}
