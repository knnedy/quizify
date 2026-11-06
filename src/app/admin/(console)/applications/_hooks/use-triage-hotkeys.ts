"use client";

import { useEffect, useRef } from "react";

type Handlers = {
  enabled: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onApprove: () => void;
  onReject: () => void;
};

export function useTriageHotkeys(handlers: Handlers) {
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const { enabled, onNext, onPrevious, onApprove, onReject } =
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

      switch (event.key.toLowerCase()) {
        case "j":
          event.preventDefault();
          onNext();
          break;
        case "k":
          event.preventDefault();
          onPrevious();
          break;
        case "a":
          event.preventDefault();
          onApprove();
          break;
        case "r":
          event.preventDefault();
          onReject();
          break;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
