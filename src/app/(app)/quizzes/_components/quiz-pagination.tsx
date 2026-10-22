import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function pageItems(page: number, pageCount: number): (number | "gap")[] {
  const wanted = new Set([1, pageCount, page - 1, page, page + 1]);
  const pages = [...wanted]
    .filter((p) => p >= 1 && p <= pageCount)
    .sort((a, b) => a - b);

  const items: (number | "gap")[] = [];
  pages.forEach((p, index) => {
    if (index > 0 && p - pages[index - 1] > 1) items.push("gap");
    items.push(p);
  });
  return items;
}

export function QuizPagination({
  page,
  pageCount,
  params,
}: {
  page: number;
  pageCount: number;
  params: Record<string, string>;
}) {
  if (pageCount <= 1) return null;

  function hrefFor(target: number) {
    const next = new URLSearchParams(params);
    if (target > 1) next.set("page", String(target));
    const query = next.toString();
    return query ? `/quizzes?${query}` : "/quizzes";
  }

  const pillClass =
    "inline-flex h-9 items-center gap-1 rounded-lg border px-3 text-sm font-medium";

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1.5">
      {page > 1 ? (
        <Link
          href={hrefFor(page - 1)}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "gap-1",
          )}>
          <ChevronLeftIcon className="size-4" />
          <span className="hidden sm:inline">Previous</span>
        </Link>
      ) : (
        <span
          aria-disabled
          className={cn(pillClass, "pointer-events-none opacity-50")}>
          <ChevronLeftIcon className="size-4" />
          <span className="hidden sm:inline">Previous</span>
        </span>
      )}

      {pageItems(page, pageCount).map((item, index) =>
        item === "gap" ? (
          <span
            key={`gap-${index}`}
            aria-hidden
            className="px-1 text-muted-foreground">
            …
          </span>
        ) : (
          <Link
            key={item}
            href={hrefFor(item)}
            aria-current={item === page ? "page" : undefined}
            aria-label={`Page ${item}`}
            className={cn(
              "inline-flex size-9 items-center justify-center rounded-lg text-sm font-medium tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-ring",
              item === page
                ? "bg-primary text-primary-foreground shadow-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}>
            {item}
          </Link>
        ),
      )}

      {page < pageCount ? (
        <Link
          href={hrefFor(page + 1)}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "gap-1",
          )}>
          <span className="hidden sm:inline">Next</span>
          <ChevronRightIcon className="size-4" />
        </Link>
      ) : (
        <span
          aria-disabled
          className={cn(pillClass, "pointer-events-none opacity-50")}>
          <span className="hidden sm:inline">Next</span>
          <ChevronRightIcon className="size-4" />
        </span>
      )}
    </nav>
  );
}
