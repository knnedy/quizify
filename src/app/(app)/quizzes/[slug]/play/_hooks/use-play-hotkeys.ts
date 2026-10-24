"use client";

import { useEffect, useRef } from "react";

type Handlers = {
  enabled: boolean;
  optionCount: number;
  onSelect: (index: number) => void;
  onNext?: () => void;
  onPrevious: () => void;
};

function indexFromKey(key: string) {
  if (/^[a-z]$/i.test(key)) return key.toUpperCase().charCodeAt(0) - 65;
  if (/^[1-9]$/.test(key)) return Number(key) - 1;
  return -1;
}

export function usePlayHotkeys(handlers: Handlers) {
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const { enabled, optionCount, onSelect, onNext, onPrevious } =
        handlersRef.current;

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

      if (event.key === "Enter") {
        // Buttons keep their own Enter, except answer options: Enter there
        // moves on instead of toggling the option again.
        const onControl = Boolean(target?.closest("button, a"));
        const onOption = Boolean(target?.closest("[data-option]"));
        if (onControl && !onOption) return;
        if (!onNext) return;

        event.preventDefault();
        onNext();
        return;
      }

      if (event.key === "ArrowRight") {
        if (onNext) {
          event.preventDefault();
          onNext();
        }
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onPrevious();
        return;
      }

      const index = indexFromKey(event.key);
      if (index >= 0 && index < optionCount) onSelect(index);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
