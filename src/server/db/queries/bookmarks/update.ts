"use server";

import db from "@/server/db";
import { quizBookmarks } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";

export async function toggleQuizBookmarkQuery(
  quizId: number,
  userId: number,
): Promise<{ isBookmarked: boolean }> {
  // Check if bookmark already exists
  const existingBookmark = await db.query.quizBookmarks.findFirst({
    where: and(
      eq(quizBookmarks.quizId, quizId),
      eq(quizBookmarks.userId, userId),
    ),
  });

  // If bookmark exists, remove it
  if (existingBookmark) {
    await db
      .delete(quizBookmarks)
      .where(
        and(eq(quizBookmarks.quizId, quizId), eq(quizBookmarks.userId, userId)),
      );

    return {
      isBookmarked: false,
    };
  }

  // If bookmark doesn't exist, create it
  await db.insert(quizBookmarks).values({
    quizId: quizId,
    userId: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return {
    isBookmarked: true,
  };
}
