import "server-only";
import { like } from "drizzle-orm";
import { slugify } from "@/lib/slug";
import { quizzes } from "@/server/db/schema";
import type { DbTransaction } from "@/server/db/types";

// A slug from the title that no other quiz uses: "title", "title-2", ...
export async function uniqueQuizSlug(tx: DbTransaction, title: string) {
  const base = slugify(title) || "quiz";

  const rows = await tx
    .select({ slug: quizzes.slug })
    .from(quizzes)
    .where(like(quizzes.slug, `${base}%`));

  const used = new Set(rows.map((row) => row.slug));
  if (!used.has(base)) return base;

  let number = 2;
  while (used.has(`${base}-${number}`)) number += 1;
  return `${base}-${number}`;
}
