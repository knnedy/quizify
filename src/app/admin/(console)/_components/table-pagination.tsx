import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Item = number | "gap";

// 1 2 … 7 8 9 … 19 20: the ends, plus a window around the current page.
function pageItems(page: number, count: number): Item[] {
  const wanted = new Set([1, 2, count - 1, count, page - 1, page, page + 1]);
  const numbers = [...wanted]
    .filter((value) => value >= 1 && value <= count)
    .sort((a, b) => a - b);

  const items: Item[] = [];
  numbers.forEach((value, index) => {
    const previous = numbers[index - 1];

    if (previous !== undefined && value - previous === 2) {
      items.push(previous + 1);
    } else if (previous !== undefined && value - previous > 2) {
      items.push("gap");
    }
    items.push(value);
  });

  return items;
}

const buttonClass =
  "inline-flex size-9 items-center justify-center rounded-lg border text-sm font-medium tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-40";

export function TablePagination({
  page,
  pageCount,
  total,
  pageSize,
  label,
  disabled = false,
  onPage,
}: {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  label: string;
  disabled?: boolean;
  onPage: (page: number) => void;
}) {
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground tabular-nums">
        Showing {from}–{to} of {total.toLocaleString("en-US")} {label}
      </p>

      {pageCount > 1 && (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Previous page"
            disabled={disabled || page <= 1}
            onClick={() => onPage(page - 1)}
            className={cn(
              buttonClass,
              "bg-card text-muted-foreground hover:border-foreground/25 hover:text-foreground",
            )}>
            <ChevronLeftIcon aria-hidden className="size-4" />
          </button>

          {pageItems(page, pageCount).map((item, index) =>
            item === "gap" ? (
              <span
                key={`gap-${index}`}
                aria-hidden
                className="w-6 text-center text-muted-foreground">
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                aria-label={`Page ${item}`}
                aria-current={item === page ? "page" : undefined}
                disabled={disabled}
                onClick={() => onPage(item)}
                className={cn(
                  buttonClass,
                  item === page
                    ? "border-primary bg-primary text-primary-foreground shadow-primary"
                    : "bg-card text-muted-foreground hover:border-foreground/25 hover:text-foreground",
                )}>
                {item}
              </button>
            ),
          )}

          <button
            type="button"
            aria-label="Next page"
            disabled={disabled || page >= pageCount}
            onClick={() => onPage(page + 1)}
            className={cn(
              buttonClass,
              "bg-card text-muted-foreground hover:border-foreground/25 hover:text-foreground",
            )}>
            <ChevronRightIcon aria-hidden className="size-4" />
          </button>
        </div>
      )}
    </nav>
  );
}
