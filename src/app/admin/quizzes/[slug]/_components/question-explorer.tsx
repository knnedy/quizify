"use client";

import { useRef, useState } from "react";
import { FlagIcon, SearchIcon, SearchXIcon, XIcon } from "lucide-react";
import { Keycap } from "@/components/keycap";
import { inputClass } from "@/components/form/form-block";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useKeyMap } from "../../../_hooks/use-key-map";
import type { PreviewQuestion } from "../mock-data";
import { QuestionCard } from "./question-card";

function matches(question: PreviewQuestion, term: string) {
  if (!term) return true;

  const haystack = [
    question.title,
    question.explanation ?? "",
    ...question.options.map((option) => option.label),
  ]
    .join("\n")
    .toLowerCase();

  return haystack.includes(term);
}

function ToggleChip({
  pressed,
  onToggle,
  children,
}: {
  pressed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onToggle}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        pressed
          ? "border-primary bg-primary-soft text-primary"
          : "bg-card text-muted-foreground hover:border-foreground/25 hover:text-foreground",
      )}>
      {children}
    </button>
  );
}

export function QuestionExplorer({
  questions,
  mentions,
}: {
  questions: PreviewQuestion[];
  mentions: Record<number, number>;
}) {
  const [search, setSearch] = useState("");
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [showExplanations, setShowExplanations] = useState(true);
  const searchRef = useRef<HTMLInputElement>(null);

  useKeyMap(true, { "/": () => searchRef.current?.focus() });

  const term = search.trim().toLowerCase();
  const flagged = questions.filter((question) => mentions[question.number]);
  const visible = questions.filter(
    (question) =>
      matches(question, term) &&
      (!flaggedOnly || (mentions[question.number] ?? 0) > 0),
  );

  function clear() {
    setSearch("");
    setFlaggedOnly(false);
  }

  return (
    <div className="space-y-5">
      <div className="sticky top-3 z-20 space-y-3 rounded-2xl border bg-card/95 p-4 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-56 flex-1">
            <SearchIcon
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              ref={searchRef}
              type="text"
              inputMode="search"
              value={search}
              placeholder="Find in this quiz"
              aria-label="Find in this quiz"
              autoComplete="off"
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") event.currentTarget.blur();
              }}
              className={cn(inputClass, "py-2 pr-10 pl-10 text-sm")}
            />

            {search ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setSearch("");
                  searchRef.current?.focus();
                }}
                className="absolute top-1/2 right-2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring">
                <XIcon aria-hidden className="size-4" />
              </button>
            ) : (
              <Keycap className="pointer-events-none absolute top-1/2 right-3 h-5 min-w-5 -translate-y-1/2 text-[11px]">
                /
              </Keycap>
            )}
          </div>

          {flagged.length > 0 && (
            <ToggleChip
              pressed={flaggedOnly}
              onToggle={() => setFlaggedOnly((value) => !value)}>
              <FlagIcon aria-hidden className="size-3.5" />
              Flagged only
              <span className="tabular-nums opacity-75">{flagged.length}</span>
            </ToggleChip>
          )}
          <ToggleChip
            pressed={showExplanations}
            onToggle={() => setShowExplanations((value) => !value)}>
            Explanations
          </ToggleChip>
        </div>

        <nav
          aria-label="Jump to a question"
          className="-mx-1 overflow-x-auto px-1">
          <ul className="flex w-max gap-1.5 pb-1">
            {visible.map((question) => {
              const flaggedCount = mentions[question.number] ?? 0;

              return (
                <li key={question.number}>
                  <a
                    href={`#question-${question.number}`}
                    aria-label={`Question ${question.number}${flaggedCount > 0 ? ", mentioned in reports" : ""}`}
                    className={cn(
                      "flex size-8 items-center justify-center rounded-lg border font-display text-sm font-bold tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                      flaggedCount > 0
                        ? "border-streak/40 bg-streak-soft text-streak-ink hover:border-streak"
                        : "bg-card text-muted-foreground hover:border-foreground/25 hover:text-foreground",
                    )}>
                    {question.number}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <p
          aria-live="polite"
          className="text-xs text-muted-foreground tabular-nums">
          Showing {visible.length} of {questions.length} questions
        </p>
      </div>

      {visible.length > 0 ? (
        <div className="space-y-5">
          {visible.map((question) => (
            <QuestionCard
              key={question.number}
              question={question}
              term={term}
              mentions={mentions[question.number] ?? 0}
              showExplanation={showExplanations}
            />
          ))}
        </div>
      ) : (
        <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-2xl border border-dashed px-6 py-16 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <SearchXIcon aria-hidden className="size-7" />
          </span>
          <div className="space-y-1">
            <h2 className="text-xl">Nothing matches</h2>
            <p className="text-sm text-muted-foreground">
              No question, answer or explanation contains that text.
            </p>
          </div>
          <Button variant="outline" onClick={clear}>
            Clear search and filters
          </Button>
        </div>
      )}
    </div>
  );
}
