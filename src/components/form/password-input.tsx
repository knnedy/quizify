"use client";

import { useState, type ComponentProps } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function PasswordInput({
  className,
  ...props
}: Omit<ComponentProps<"input">, "type">) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? "text" : "password"}
        className={cn(className, "pr-12")}
      />
      <button
        type="button"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        onClick={() => setVisible((value) => !value)}
        className="absolute top-1/2 right-1.5 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring">
        {visible ? (
          <EyeOffIcon aria-hidden className="size-4.5" />
        ) : (
          <EyeIcon aria-hidden className="size-4.5" />
        )}
      </button>
    </div>
  );
}
