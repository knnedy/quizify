import Link from "next/link";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden>
      <rect width="32" height="32" rx="9" className="fill-primary" />
      <circle
        cx="15"
        cy="15"
        r="6.5"
        fill="none"
        stroke="white"
        strokeWidth="3"
      />
      <path
        d="M19.5 19.5 24 24"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Brand({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Quizify home"
      className={cn(
        "flex items-center gap-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
        className,
      )}>
      <BrandMark />
      <span className="font-display text-xl font-bold tracking-tight">
        Quizify
      </span>
    </Link>
  );
}
