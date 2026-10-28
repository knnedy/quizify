import type { RefObject } from "react";
import { SearchIcon, XIcon } from "lucide-react";
import { Keycap } from "@/components/keycap";
import { inputClass } from "@/components/quiz-editor/form-block";
import { cn } from "@/lib/utils";
import { FilterTabs } from "../../_components/filter-tabs";
import type { UserFilter } from "../query-params";

const labels: Record<UserFilter, string> = {
  all: "All",
  players: "Players",
  creators: "Creators",
  staff: "Staff",
  banned: "Banned",
};

const order: UserFilter[] = ["all", "players", "creators", "staff", "banned"];

export function UsersToolbar({
  filter,
  counts,
  search,
  inputRef,
  onSearch,
  onFilter,
}: {
  filter: UserFilter;
  counts: Record<UserFilter, number>;
  search: string;
  inputRef: RefObject<HTMLInputElement | null>;
  onSearch: (value: string) => void;
  onFilter: (filter: UserFilter) => void;
}) {
  const options = order.map((value) => ({
    value,
    label: labels[value],
    count: counts[value],
  }));

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <FilterTabs
        label="Filter users"
        value={filter}
        options={options}
        onChange={onFilter}
      />

      <div className="relative w-full sm:w-80">
        <SearchIcon
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <input
          ref={inputRef}
          type="text"
          inputMode="search"
          value={search}
          placeholder="Search name or email"
          aria-label="Search users"
          autoComplete="off"
          onChange={(event) => onSearch(event.target.value)}
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
              onSearch("");
              inputRef.current?.focus();
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
    </div>
  );
}
