import "server-only";
import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  ne,
  or,
  sql,
} from "drizzle-orm";
import type { Difficulty } from "@/lib/difficulty";
import type { QuizSort } from "@/lib/quiz-browse";
import { db } from "@/server/db";
import {
  categories,
  questions,
  quizAttempts,
  quizBookmarks,
  quizRatings,
  quizzes,
  users,
} from "@/server/db/schema";
import type { CategoryWithCount, QuizList } from "@/types/quiz";
import { publiclyListed } from "./visibility";

const DEFAULT_PAGE_SIZE = 12;

export type ListQuizzesParams = {
  search?: string;
  category?: string;
  difficulty?: Difficulty;
  sort?: QuizSort;
  page?: number;
  pageSize?: number;
  exclude?: string;
  viewerId?: number;
};

// Per quiz counts, joined into the list query
const questionStats = db
  .select({
    quizId: questions.quizId,
    total: sql<number>`count(*)::int`.as("question_total"),
  })
  .from(questions)
  .groupBy(questions.quizId)
  .as("question_stats");

const playStats = db
  .select({
    quizId: quizAttempts.quizId,
    total: sql<number>`count(*)::int`.as("play_total"),
  })
  .from(quizAttempts)
  .where(inArray(quizAttempts.status, ["COMPLETED", "TIMED_OUT"]))
  .groupBy(quizAttempts.quizId)
  .as("play_stats");

const ratingStats = db
  .select({
    quizId: quizRatings.quizId,
    total: sql<number>`count(*)::int`.as("rating_total"),
    average: sql<number>`avg(${quizRatings.rating})::float`.as(
      "rating_average",
    ),
  })
  .from(quizRatings)
  .groupBy(quizRatings.quizId)
  .as("rating_stats");

const questionCount = sql<number>`coalesce(${questionStats.total}, 0)`;
const playCount = sql<number>`coalesce(${playStats.total}, 0)`;
const ratingCount = sql<number>`coalesce(${ratingStats.total}, 0)`;
const averageRating = sql<number | null>`${ratingStats.average}`;
const publishedOrCreated = sql`coalesce(${quizzes.publishedAt}, ${quizzes.createdAt})`;

function likePattern(term: string) {
  return `%${term.replace(/[\\%_]/g, "\\$&")}%`;
}

function orderFor(sort: QuizSort) {
  if (sort === "popular") {
    return [desc(playCount), desc(publishedOrCreated), desc(quizzes.id)];
  }
  if (sort === "top-rated") {
    return [
      sql`${averageRating} desc nulls last`,
      desc(ratingCount),
      desc(publishedOrCreated),
      desc(quizzes.id),
    ];
  }
  return [desc(publishedOrCreated), desc(quizzes.id)];
}

export async function listQuizzes(
  params: ListQuizzesParams = {},
): Promise<QuizList> {
  const { search, category, difficulty, exclude, viewerId } = params;
  const sort = params.sort ?? "newest";
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;

  const where = and(
    publiclyListed,
    search
      ? or(
          ilike(quizzes.title, likePattern(search)),
          ilike(quizzes.description, likePattern(search)),
        )
      : undefined,
    category ? eq(categories.slug, category) : undefined,
    difficulty ? eq(quizzes.difficulty, difficulty) : undefined,
    exclude ? ne(quizzes.slug, exclude) : undefined,
  );

  const [totalRow] = await db
    .select({ total: count() })
    .from(quizzes)
    .innerJoin(categories, eq(categories.id, quizzes.categoryId))
    .where(where);

  const total = totalRow?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(params.page ?? 1, 1), pageCount);

  const rows = await db
    .select({
      slug: quizzes.slug,
      title: quizzes.title,
      description: quizzes.description,
      difficulty: quizzes.difficulty,
      timeLimitSeconds: quizzes.timeLimitSeconds,
      categoryName: categories.name,
      categorySlug: categories.slug,
      authorName: users.name,
      questionCount,
      playCount,
      ratingCount,
      averageRating,
      isBookmarked: sql<boolean>`${quizBookmarks.quizId} is not null`,
    })
    .from(quizzes)
    .innerJoin(categories, eq(categories.id, quizzes.categoryId))
    .leftJoin(users, eq(users.id, quizzes.userId))
    .leftJoin(questionStats, eq(questionStats.quizId, quizzes.id))
    .leftJoin(playStats, eq(playStats.quizId, quizzes.id))
    .leftJoin(ratingStats, eq(ratingStats.quizId, quizzes.id))
    .leftJoin(
      quizBookmarks,
      and(
        eq(quizBookmarks.quizId, quizzes.id),
        viewerId === undefined
          ? sql`false`
          : eq(quizBookmarks.userId, viewerId),
      ),
    )
    .where(where)
    .orderBy(...orderFor(sort))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return {
    items: rows.map((row) => ({
      slug: row.slug,
      title: row.title,
      description: row.description,
      category: { name: row.categoryName, slug: row.categorySlug },
      difficulty: row.difficulty,
      questions: row.questionCount,
      timeLimitMinutes: row.timeLimitSeconds
        ? Math.round(row.timeLimitSeconds / 60)
        : null,
      avgRating: row.averageRating,
      ratings: row.ratingCount,
      plays: row.playCount,
      author: row.authorName ? { name: row.authorName } : null,
      isBookmarked: row.isBookmarked,
    })),
    total,
    page,
    pageSize,
    pageCount,
  };
}

export async function getMostPlayedQuiz() {
  const { items } = await listQuizzes({ sort: "popular", pageSize: 1 });
  return items[0] ?? null;
}

export async function listCategories(): Promise<CategoryWithCount[]> {
  return db
    .select({
      name: categories.name,
      slug: categories.slug,
      count: count(quizzes.id),
    })
    .from(categories)
    .leftJoin(
      quizzes,
      and(eq(quizzes.categoryId, categories.id), publiclyListed),
    )
    .groupBy(categories.id)
    .orderBy(asc(categories.id));
}
