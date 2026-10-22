"use client";

import { useRef } from "react";
import type { ReactNode } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useScrollEdges } from "@/hooks/use-scroll-edges";
import { cn } from "@/lib/utils";

const arrowClass =
  "absolute top-1/2 z-10 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border bg-card text-foreground shadow-sm transition-colors pointer-fine:inline-flex hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring";

export function ScrollRow({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { start, end } = useScrollEdges(ref);

  function scrollByPage(direction: 1 | -1) {
    const element = ref.current;
    if (!element) return;
    element.scrollBy({ left: direction * element.clientWidth * 0.7 });
  }

  const mask =
    start && end
      ? undefined
      : `linear-gradient(to right, ${start ? "#000" : "transparent"}, #000 3rem, #000 calc(100% - 3rem), ${end ? "#000" : "transparent"})`;

  return (
    <div className="relative">
      <div
        ref={ref}
        role="group"
        aria-label={label}
        style={{ maskImage: mask, WebkitMaskImage: mask }}
        className={cn(
          "-my-1 flex gap-2 overflow-x-auto scroll-smooth py-1 scrollbar-none [&::-webkit-scrollbar]:hidden",
          className,
        )}>
        {children}
      </div>

      {!start && (
        <button
          type="button"
          aria-label="Scroll left"
          onClick={() => scrollByPage(-1)}
          className={cn(arrowClass, "left-1")}>
          <ChevronLeftIcon className="size-4" />
        </button>
      )}
      {!end && (
        <button
          type="button"
          aria-label="Scroll right"
          onClick={() => scrollByPage(1)}
          className={cn(arrowClass, "right-1")}>
          <ChevronRightIcon className="size-4" />
        </button>
      )}
    </div>
  );
}
