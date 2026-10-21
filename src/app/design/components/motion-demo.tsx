"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MotionDemo() {
  const [popKey, setPopKey] = useState(0);
  const [shakeKey, setShakeKey] = useState(0);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col items-center gap-4 rounded-xl border bg-card p-6 shadow-card">
        <div
          key={popKey}
          className={cn(
            "flex h-16 w-full items-center justify-center rounded-xl bg-correct-soft font-medium text-correct",
            popKey > 0 && "animate-pop",
          )}>
          Correct answer
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPopKey((n) => n + 1)}>
          Replay pop
        </Button>
      </div>

      <div className="flex flex-col items-center gap-4 rounded-xl border bg-card p-6 shadow-card">
        <div
          key={shakeKey}
          className={cn(
            "flex h-16 w-full items-center justify-center rounded-xl bg-incorrect-soft font-medium text-incorrect",
            shakeKey > 0 && "animate-shake",
          )}>
          Wrong answer
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShakeKey((n) => n + 1)}>
          Replay shake
        </Button>
      </div>
    </div>
  );
}
