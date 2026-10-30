import Link from "next/link";
import { ShieldAlertIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { AttentionItem } from "../mock-data";

export function AttentionBanner({ items }: { items: AttentionItem[] }) {
  if (items.length === 0) return null;

  return (
    <section aria-label="Needs your attention" className="space-y-3">
      {items.map((item) => (
        <div
          key={item.slug}
          className="flex flex-col gap-4 rounded-2xl border border-incorrect/30 bg-incorrect-soft p-5 text-incorrect-ink sm:flex-row sm:items-center">
          <ShieldAlertIcon aria-hidden className="size-6 shrink-0" />

          <div className="min-w-0 flex-1 space-y-1">
            <p className="font-semibold">{item.title} is suspended</p>
            <p className="text-sm">{item.reason}</p>
          </div>

          <Link
            href={`/my-quizzes/${item.slug}/edit`}
            className={buttonVariants({ variant: "outline" })}>
            Open quiz
          </Link>
        </div>
      ))}
    </section>
  );
}
