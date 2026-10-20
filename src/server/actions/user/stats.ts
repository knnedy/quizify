"use server";

import { auth } from "@/server/auth";
import { headers } from "next/headers";
import { resetStreak } from "./streak";
import { UserActionError } from "@/server/utils/error";
import {
  selectUserById,
  selectUserStats,
} from "@/server/db/queries/user/select";
import { UserStats } from "@/lib/types";

export async function getUserStats(userId?: string): Promise<UserStats> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new UserActionError(
        "UNAUTHORIZED",
        "No active session found",
        "getUserStats",
      );
    }

    if (!userId || userId !== session.user.id) {
      throw new UserActionError(
        "UNAUTHORIZED",
        "User ID mismatch or missing",
        "getUserStats",
      );
    }

    const userIdNum = parseInt(userId);

    const streakResult = await resetStreak(userIdNum);

    const user = await selectUserById(userIdNum);

    if (!user) {
      throw new UserActionError("NOT_FOUND", "User not found", "getUserStats");
    }

    const statsResults = await selectUserStats(user);

    const stats: UserStats = {
      averageTimePerQuiz: statsResults.averageTimePerQuiz ?? 0, // Average time per quiz in seconds
      totalQuizzesTaken: statsResults.totalQuizzesTaken ?? 0,
      averageScore: statsResults.averageScore ?? 0,
      topCategory: statsResults.topCategory ?? "None",
      completionRate: statsResults.completionRate ?? 0,
      bestStreak: statsResults.bestStreak ?? 0,
      currentStreak: streakResult.currentStreak,
      totalXP: user.totalXp,
    };

    return stats;
  } catch (error) {
    console.error(error);
    if (error instanceof UserActionError) {
      throw error;
    }
    throw new UserActionError(
      "DATABASE_ERROR",
      "Failed to fetch user statistics",
      "getUserStats",
    );
  }
}
