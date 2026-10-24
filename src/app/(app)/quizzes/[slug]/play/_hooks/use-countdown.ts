"use client";

import { useEffect, useRef, useState } from "react";

export function useCountdown({
  totalSeconds,
  running,
  onExpire,
}: {
  totalSeconds: number | null;
  running: boolean;
  onExpire: () => void;
}) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  });

  useEffect(() => {
    if (totalSeconds === null || !running) return;

    const deadline = Date.now() + totalSeconds * 1000;

    const id = window.setInterval(() => {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemaining(left);

      if (left === 0) {
        window.clearInterval(id);
        onExpireRef.current();
      }
    }, 250);

    return () => window.clearInterval(id);
  }, [totalSeconds, running]);

  return remaining;
}
