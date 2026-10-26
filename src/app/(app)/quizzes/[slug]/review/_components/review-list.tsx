"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ReviewCounts, ReviewQuestion, ReviewStatus } from "../mock-data";
import { QuestionNav } from "./question-nav";
import { ReviewQuestionCard } from "./review-question";

type Filter = "all" | ReviewStatus;

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "incorrect", label: "Incorrect" },
  { value: "skipped", label: "Not answered" },
  { value: "correct", label: "Correct" },
];

export function ReviewList({
  questions,
  counts,
}: {
  questions: ReviewQuestion[];
  counts: ReviewCounts;
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const present = (["incorrect", "skipped", "correct"] as const).filter(
    (status) => counts[status] > 0,
  );
  const showFilters = present.length > 1;
  const options = filters.filter(
    (item) => item.value === "all" || present.includes(item.value),
  );

  const visible =
    filter === "all"
      ? questions
      : questions.filter((question) => question.status === filter);

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-2xl border bg-card p-4 shadow-xs sm:p-5">
        {showFilters && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div
              role="group"
              aria-label="Filter questions"
              className="inline-flex flex-wrap gap-1 rounded-xl border bg-muted/50 p-1">
              {options.map((item) => {
                const active = filter === item.value;
                const count =
                  item.value === "all" ? questions.length : counts[item.value];

                return (
                  <button
                    key={item.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setFilter(item.value)}
                    className={cn(
                      "inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                      active
                        ? "bg-primary text-primary-foreground shadow-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}>
                    {item.label}
                    <span className="tabular-nums opacity-75">{count}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-sm text-muted-foreground tabular-nums">
              Showing {visible.length} of {questions.length}
            </p>
          </div>
        )}

        <QuestionNav questions={visible} />
      </div>

      <div className="space-y-5">
        {visible.map((question) => (
          <ReviewQuestionCard key={question.id} question={question} />
        ))}
      </div>
    </div>
  );
}
