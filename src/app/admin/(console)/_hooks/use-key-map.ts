"use client";

import { useEffect, useRef } from "react";

// Single key shortcuts for admin lists. They never fire while typing in a
// field or with a modifier held.
export function useKeyMap(enabled: boolean, map: Record<string, () => void>) {
  const ref = useRef({ enabled, map });

  useEffect(() => {
    ref.current = { enabled, map };
  });

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const { enabled, map } = ref.current;

      if (
        !enabled ||
        event.repeat ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target instanceof HTMLElement ? event.target : null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      const handler = map[event.key.toLowerCase()];
      if (!handler) return;

      event.preventDefault();
      handler();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
