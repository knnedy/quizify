"use client";

import {
  Fragment,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { CheckIcon, ChevronsUpDownIcon, SearchIcon } from "lucide-react";
import { describeTimezone, listTimezonesWith } from "@/lib/timezone-list";
import { cn } from "@/lib/utils";

const PANEL_GAP = 8;
const VIEWPORT_MARGIN = 12;
const PANEL_MAX_HEIGHT = 340;
const PANEL_MIN_HEIGHT = 220;

// Places the panel under the trigger, or above it when there is more room
// there. Fixed positioning against the window, so no parent can clip it.
function measure(trigger: HTMLElement): CSSProperties {
  const rect = trigger.getBoundingClientRect();
  const below = window.innerHeight - rect.bottom - PANEL_GAP - VIEWPORT_MARGIN;
  const above = rect.top - PANEL_GAP - VIEWPORT_MARGIN;
  const openUp = below < PANEL_MIN_HEIGHT && above > below;
  const room = openUp ? above : below;

  return {
    position: "fixed",
    left: rect.left,
    width: rect.width,
    maxHeight: Math.min(PANEL_MAX_HEIGHT, Math.max(room, 160)),
    ...(openUp
      ? { bottom: window.innerHeight - rect.top + PANEL_GAP }
      : { top: rect.bottom + PANEL_GAP }),
  };
}

export function TimezonePicker({
  id,
  value,
  onChange,
  className,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [panelStyle, setPanelStyle] = useState<CSSProperties | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const current = describeTimezone(value);
  const term = query.trim().toLowerCase();

  const options = useMemo(
    () => (open ? listTimezonesWith(value) : []),
    [open, value],
  );
  const visible = useMemo(
    () =>
      term ? options.filter((option) => option.search.includes(term)) : options,
    [options, term],
  );

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    }

    function reposition(event?: Event) {
      // Scrolling the list itself must not move the panel.
      if (event && panelRef.current?.contains(event.target as Node)) return;

      const trigger = triggerRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        setOpen(false);
        return;
      }
      setPanelStyle(measure(trigger));
    }

    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open]);

  // Scrolls the list itself, never the page, so stepping through options
  // can't make the whole screen jump.
  useEffect(() => {
    if (!open) return;

    const list = listRef.current;
    const item = list?.querySelector<HTMLElement>("[data-active='true']");
    if (!list || !item) return;

    const top = item.offsetTop;
    const bottom = top + item.offsetHeight;

    if (top < list.scrollTop) {
      list.scrollTop = top;
    } else if (bottom > list.scrollTop + list.clientHeight) {
      list.scrollTop = bottom - list.clientHeight;
    }
  }, [open, active, visible]);

  function openPanel() {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const index = listTimezonesWith(value).findIndex(
      (option) => option.value === value,
    );
    setPanelStyle(measure(trigger));
    setQuery("");
    setActive(Math.max(0, index));
    setOpen(true);
  }

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function select(next: string) {
    onChange(next);
    close();
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const last = visible.length - 1;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActive((index) => Math.min(index + 1, last));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActive((index) => Math.max(index - 1, 0));
        break;
      case "Home":
        event.preventDefault();
        setActive(0);
        break;
      case "End":
        event.preventDefault();
        setActive(Math.max(last, 0));
        break;
      case "Enter": {
        // The picker sits inside a form, so Enter must never submit it.
        event.preventDefault();
        const option = visible[active];
        if (option) select(option.value);
        break;
      }
      case "Escape":
        event.preventDefault();
        close();
        break;
    }
  }

  return (
    <div ref={rootRef} className={cn("relative w-full", className)}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => (open ? close() : openPanel())}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-input bg-card px-4 py-3 text-left text-base shadow-xs transition-colors hover:border-foreground/25 focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-ring/40 aria-expanded:border-ring">
        <span className="min-w-0 truncate">{current.city}</span>
        <span className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground tabular-nums">
          {current.offset}
          <ChevronsUpDownIcon aria-hidden className="size-4" />
        </span>
      </button>

      {open &&
        panelStyle &&
        createPortal(
          <div
            ref={panelRef}
            style={panelStyle}
            className="z-50 flex animate-in flex-col overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-md duration-100 fade-in-0 zoom-in-95">
            <div className="flex shrink-0 items-center gap-2 border-b px-3">
              <SearchIcon
                aria-hidden
                className="size-4 shrink-0 text-muted-foreground"
              />
              <input
                autoFocus
                value={query}
                role="combobox"
                aria-expanded
                aria-controls={listId}
                aria-autocomplete="list"
                aria-activedescendant={
                  visible[active] ? `${listId}-${active}` : undefined
                }
                aria-label="Search timezones"
                placeholder="Search a city or region"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActive(0);
                }}
                onKeyDown={onKeyDown}
                className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>

            <ul
              ref={listRef}
              id={listId}
              role="listbox"
              aria-label="Timezones"
              className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain p-1">
              {visible.length === 0 && (
                <li
                  role="presentation"
                  className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No timezone matches &ldquo;{query.trim()}&rdquo;
                </li>
              )}

              {visible.map((option, index) => {
                const showRegion =
                  index === 0 || visible[index - 1].region !== option.region;
                const isActive = index === active;
                const selected = option.value === value;

                return (
                  <Fragment key={option.value}>
                    {showRegion && (
                      <li
                        role="presentation"
                        className="px-3 pt-2.5 pb-1 text-xs font-medium text-muted-foreground">
                        {option.region}
                      </li>
                    )}
                    <li
                      id={`${listId}-${index}`}
                      role="option"
                      aria-selected={selected}
                      data-active={isActive}
                      onClick={() => select(option.value)}
                      onMouseMove={() => setActive(index)}
                      className={cn(
                        "flex cursor-default items-center gap-3 rounded-lg px-3 py-2 text-sm",
                        isActive && "bg-accent text-accent-foreground",
                        selected && "font-medium",
                      )}>
                      <span className="min-w-0 flex-1 truncate">
                        {option.city}
                      </span>
                      <span className="shrink-0 text-muted-foreground tabular-nums">
                        {option.offset}
                      </span>
                      <CheckIcon
                        aria-hidden
                        className={cn(
                          "size-4 shrink-0 text-primary",
                          !selected && "invisible",
                        )}
                      />
                    </li>
                  </Fragment>
                );
              })}
            </ul>
          </div>,
          document.body,
        )}
    </div>
  );
}
