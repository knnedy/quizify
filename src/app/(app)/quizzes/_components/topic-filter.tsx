"use client";

import type { ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { LayoutGridIcon } from "lucide-react";
import { ScrollRow } from "@/components/scroll-row";
import { getCategoryIcon } from "@/lib/category-icons";
import { cn } from "@/lib/utils";
import { useQuizParams } from "../_hooks/use-quiz-params";

function Topic({
  active,
  onClick,
  icon,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  count?: number;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center gap-2.5 rounded-xl border py-1.5 pr-3.5 pl-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        active
          ? "border-primary bg-primary-soft text-foreground"
          : "bg-card text-muted-foreground hover:border-foreground/25 hover:text-foreground",
      )}>
      <span
        className={cn(
          "flex size-7 items-center justify-center rounded-lg transition-colors [&_svg]:size-4",
          active
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground",
        )}>
        {icon}
      </span>
      {children}
      {count !== undefined && (
        <span className="text-xs tabular-nums text-muted-foreground">
          {count}
        </span>
      )}
    </button>
  );
}

export function TopicFilter({
  categories,
}: {
  categories: { name: string; slug: string; count: number }[];
}) {
  const searchParams = useSearchParams();
  const { update } = useQuizParams();
  const active = searchParams.get("category");

  return (
    <ScrollRow label="Topic" className="-mx-6 px-6 sm:-mx-1 sm:px-1">
      <Topic
        active={!active}
        onClick={() => update({ category: null })}
        icon={<LayoutGridIcon />}>
        All topics
      </Topic>
      {categories.map((category) => {
        const Icon = getCategoryIcon(category.slug);
        return (
          <Topic
            key={category.slug}
            active={active === category.slug}
            onClick={() =>
              update({
                category: active === category.slug ? null : category.slug,
              })
            }
            icon={<Icon />}
            count={category.count}>
            {category.name}
          </Topic>
        );
      })}
    </ScrollRow>
  );
}
