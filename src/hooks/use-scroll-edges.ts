"use client";

import { useCallback, useEffect, useState } from "react";
import type { RefObject } from "react";

export function useScrollEdges(ref: RefObject<HTMLElement | null>) {
  const [edges, setEdges] = useState({ start: true, end: true });

  const measure = useCallback(() => {
    const element = ref.current;
    if (!element) return;

    const start = element.scrollLeft <= 1;
    const end =
      element.scrollLeft + element.clientWidth >= element.scrollWidth - 1;

    setEdges((previous) =>
      previous.start === start && previous.end === end
        ? previous
        : { start, end },
    );
  }, [ref]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener("scroll", measure, { passive: true });

    const observer = new ResizeObserver(measure);
    observer.observe(element);
    for (const child of Array.from(element.children)) observer.observe(child);

    return () => {
      element.removeEventListener("scroll", measure);
      observer.disconnect();
    };
  }, [ref, measure]);

  return edges;
}
