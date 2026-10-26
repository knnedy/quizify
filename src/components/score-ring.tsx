"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const sizes = {
  md: { box: "size-20", text: "text-lg" },
  lg: { box: "size-44 sm:size-52", text: "text-5xl sm:text-6xl" },
};

const RADIUS = 34;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function getTone(percentage: number) {
  if (percentage >= 70) return "text-correct";
  if (percentage >= 40) return "text-xp";
  return "text-incorrect";
}

export function ScoreRing({
  percentage,
  size = "md",
  animate = false,
  className,
}: {
  percentage: number;
  size?: keyof typeof sizes;
  animate?: boolean;
  className?: string;
}) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!animate) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const duration = reduced ? 0 : 1100;
    const start = performance.now();
    let frame = 0;

    function tick(now: number) {
      const progress =
        duration === 0 ? 1 : Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setShown(Math.round(percentage * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [animate, percentage]);

  const value = animate ? shown : percentage;

  return (
    <div
      role="img"
      aria-label={`Score ${percentage} percent`}
      className={cn("relative shrink-0", sizes[size].box, className)}>
      <svg viewBox="0 0 80 80" className="size-full -rotate-90" aria-hidden>
        <circle
          cx="40"
          cy="40"
          r={RADIUS}
          fill="none"
          strokeWidth="7"
          className="stroke-muted"
        />
        {value > 0 && (
          <circle
            cx="40"
            cy="40"
            r={RADIUS}
            fill="none"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${(CIRCUMFERENCE * value) / 100} ${CIRCUMFERENCE}`}
            className={cn("stroke-current", getTone(percentage))}
          />
        )}
      </svg>
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 flex items-center justify-center font-display font-bold tabular-nums",
          sizes[size].text,
        )}>
        {value}
        <span className="ml-0.5 text-[0.5em] text-muted-foreground">%</span>
      </span>
    </div>
  );
}
