import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// On desktop both panes fill the space under the toolbar and scroll on their
// own, so the detail never moves while the list scrolls. On phones the two
// take turns.
export function SplitPane({
  list,
  detail,
  showDetail,
}: {
  list: ReactNode;
  detail: ReactNode;
  showDetail: boolean;
}) {
  return (
    <div className="grid gap-5 lg:min-h-0 lg:flex-1 lg:grid-cols-[24rem_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)]">
      <div
        className={cn(
          "lg:-mx-1 lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:p-1",
          showDetail && "max-lg:hidden",
        )}>
        {list}
      </div>
      <div
        className={cn(
          "flex flex-col lg:min-h-0",
          !showDetail && "max-lg:hidden",
        )}>
        {detail}
      </div>
    </div>
  );
}
