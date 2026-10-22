"use client";

import { useEffect, useRef, useTransition } from "react";
import type { FormEvent, ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDownIcon, Loader2Icon, SearchIcon, XIcon } from "lucide-react";
import { difficulties, difficultyInfo } from "@/lib/difficulty";
import { defaultQuizSort, isQuizSort, quizSorts } from "@/lib/quiz-browse";
import { cn } from "@/lib/utils";

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-primary"
          : "bg-card text-muted-foreground hover:border-foreground/25 hover:text-foreground",
      )}>
      {children}
    </button>
  );
}

export function QuizFilters({
  categories,
}: {
  categories: { name: string; slug: string; count: number }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category");
  const difficulty = searchParams.get("difficulty");
  const rawSort = searchParams.get("sort") ?? undefined;
  const sort = isQuizSort(rawSort) ? rawSort : defaultQuizSort;
  const hasFilters = Boolean(q || category || difficulty);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const lastPushedRef = useRef(q);

  // Keep the input in step when the URL changes from outside this component,
  // for example the "Clear filters" link in the empty state.
  useEffect(() => {
    if (q !== lastPushedRef.current) {
      lastPushedRef.current = q;
      if (inputRef.current) inputRef.current.value = q;
    }
  }, [q]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  function update(changes: Record<string, string | null>) {
    const next = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    next.delete("page");
    const query = next.toString();

    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  }

  function pushSearch(value: string) {
    const next = value.trim();
    if (next === lastPushedRef.current) return;
    lastPushedRef.current = next;
    update({ q: next || null });
  }

  function onSearchChange(value: string) {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => pushSearch(value), 300);
  }

  function onSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearTimeout(timerRef.current);
    pushSearch(inputRef.current?.value ?? "");
  }

  function clearSearch() {
    clearTimeout(timerRef.current);
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }
    pushSearch("");
  }

  function clearAll() {
    clearTimeout(timerRef.current);
    if (inputRef.current) inputRef.current.value = "";
    lastPushedRef.current = "";
    update({ q: null, category: null, difficulty: null });
  }

  const levelOptions = [
    { value: null, label: "Any level" },
    ...difficulties.map((d) => ({ value: d, label: difficultyInfo[d].label })),
  ];

  return (
    <div className="space-y-4">
      <form role="search" onSubmit={onSearchSubmit} className="group relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          inputMode="search"
          enterKeyHint="search"
          aria-label="Search quizzes"
          placeholder="Search quizzes by title or topic"
          defaultValue={q}
          autoComplete="off"
          onChange={(event) => onSearchChange(event.target.value)}
          className="h-13 w-full rounded-xl border bg-card pr-20 pl-12 text-base shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
        />
        <div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1">
          {isPending && (
            <Loader2Icon
              aria-hidden
              className="size-4 animate-spin text-muted-foreground"
            />
          )}
          <button
            type="button"
            aria-label="Clear search"
            onClick={clearSearch}
            className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors group-has-[input:placeholder-shown]:hidden hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring">
            <XIcon className="size-4" />
          </button>
        </div>
      </form>

      <div
        role="group"
        aria-label="Topic"
        className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 scrollbar-none sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
        <Chip active={!category} onClick={() => update({ category: null })}>
          All topics
        </Chip>
        {categories.map((item) => (
          <Chip
            key={item.slug}
            active={category === item.slug}
            onClick={() =>
              update({ category: category === item.slug ? null : item.slug })
            }>
            {item.name}
            <span className="text-xs tabular-nums opacity-70">
              {item.count}
            </span>
          </Chip>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="group"
          aria-label="Difficulty"
          className="inline-flex max-w-full overflow-x-auto rounded-xl border bg-muted/50 p-1">
          {levelOptions.map((option) => {
            const active = (difficulty ?? null) === option.value;
            return (
              <button
                key={option.label}
                type="button"
                aria-pressed={active}
                onClick={() => update({ difficulty: option.value })}
                className={cn(
                  "shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                  active
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}>
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          {hasFilters && (
            <button
              type="button"
              onClick={clearAll}
              className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-ring">
              Clear filters
            </button>
          )}
          <label className="relative inline-flex items-center">
            <span className="sr-only">Sort by</span>
            <select
              value={sort}
              onChange={(event) =>
                update({
                  sort:
                    event.target.value === defaultQuizSort
                      ? null
                      : event.target.value,
                })
              }
              className="h-10 appearance-none rounded-xl border bg-card pr-9 pl-3.5 text-sm font-medium shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20">
              {quizSorts.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-3 size-4 text-muted-foreground" />
          </label>
        </div>
      </div>
    </div>
  );
}
