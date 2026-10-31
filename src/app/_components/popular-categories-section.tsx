import Link from "next/link";
import { getCategoryIcon } from "@/lib/category-icons";
import type { CategoryWithCount } from "@/types/quiz";

export default function PopularCategoriesSection({
  categories,
}: {
  categories: CategoryWithCount[];
}) {
  const topics = categories.filter((category) => category.count > 0);

  if (topics.length === 0) return null;

  return (
    <section className="border-y bg-muted/40">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <div className="mb-10 space-y-2">
          <h2 className="text-3xl sm:text-4xl">Browse by topic</h2>
          <p className="max-w-prose text-base text-muted-foreground">
            Pick a subject and see every quiz in it.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {topics.map(({ name, slug, count }) => {
            const Icon = getCategoryIcon(slug);
            return (
              <Link
                key={slug}
                href={`/quizzes?category=${slug}`}
                className="group flex flex-col gap-8 rounded-2xl border bg-card p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-5" />
                </span>
                <span className="space-y-0.5">
                  <span className="block font-display text-lg font-semibold">
                    {name}
                  </span>
                  <span className="block text-sm text-muted-foreground tabular-nums">
                    {count} {count === 1 ? "quiz" : "quizzes"}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
