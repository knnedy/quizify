"use client";

import { useEffect, useRef, useState } from "react";

export function useCountdown({
  seconds,
  running,
  onExpire,
}: {
  seconds: number | null;
  running: boolean;
  onExpire: () => void;
}) {
  const [remaining, setRemaining] = useState(seconds);
  const deadlineRef = useRef<number | null>(null);
  const expiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  });

  useEffect(() => {
    if (seconds === null || !running) return;

    // The deadline is fixed once, so pausing and resuming never restarts it
    if (deadlineRef.current === null) {
      deadlineRef.current = Date.now() + seconds * 1000;
    }
    const deadline = deadlineRef.current;

    const id = window.setInterval(() => {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemaining(left);

      if (left === 0) {
        window.clearInterval(id);

        if (!expiredRef.current) {
          expiredRef.current = true;
          onExpireRef.current();
        }
      }
    }, 250);

    return () => window.clearInterval(id);
  }, [seconds, running]);

  return remaining;
}
