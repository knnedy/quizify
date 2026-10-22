"use client";

import { useEffect, useRef } from "react";
import type { FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2Icon, SearchIcon, XIcon } from "lucide-react";
import { Keycap } from "@/components/keycap";
import { useQuizParams } from "../_hooks/use-quiz-params";

export function QuizSearch() {
  const searchParams = useSearchParams();
  const { update, isPending } = useQuizParams();

  const q = searchParams.get("q") ?? "";
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const lastPushedRef = useRef(q);

  // Keep the input in step when the URL changes from outside this component,
  // for example "Clear filters" in the toolbar.
  useEffect(() => {
    if (q !== lastPushedRef.current) {
      lastPushedRef.current = q;
      if (inputRef.current) inputRef.current.value = q;
    }
  }, [q]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  // Press "/" anywhere on the page to jump to search.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "/") return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      event.preventDefault();
      inputRef.current?.focus();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function pushSearch(value: string) {
    const next = value.trim();
    if (next === lastPushedRef.current) return;
    lastPushedRef.current = next;
    update({ q: next || null });
  }

  function onChange(value: string) {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => pushSearch(value), 300);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearTimeout(timerRef.current);
    pushSearch(inputRef.current?.value ?? "");
  }

  function clear() {
    clearTimeout(timerRef.current);
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }
    pushSearch("");
  }

  return (
    <form role="search" onSubmit={onSubmit} className="group relative">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-muted-foreground" />
      <input
        ref={inputRef}
        type="text"
        inputMode="search"
        enterKeyHint="search"
        aria-label="Search quizzes"
        aria-keyshortcuts="/"
        placeholder="Search by title or topic"
        defaultValue={q}
        autoComplete="off"
        onChange={(event) => onChange(event.target.value)}
        className="h-14 w-full rounded-2xl border bg-card pr-24 pl-13 text-base shadow-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15"
      />
      <div className="absolute top-1/2 right-4 flex -translate-y-1/2 items-center gap-1.5">
        {isPending && (
          <Loader2Icon
            aria-hidden
            className="size-4 animate-spin text-muted-foreground"
          />
        )}
        <button
          type="button"
          aria-label="Clear search"
          onClick={clear}
          className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors group-has-[input:placeholder-shown]:hidden hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring">
          <XIcon className="size-4" />
        </button>
        <Keycap className="hidden transition-opacity group-focus-within:opacity-0 sm:group-has-[input:placeholder-shown]:inline-flex">
          /
        </Keycap>
      </div>
    </form>
  );
}
