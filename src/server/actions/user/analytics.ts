"use server";

import { auth } from "@/server/auth";
import { UserActionError } from "@/server/utils/error";
import { CategoryPerformance, WeeklyProgress } from "@/lib/types";
import { headers } from "next/headers";
import {
  selectUserCategoryPerformance,
  selectUserWeeklyProgress,
} from "@/server/db/queries/attempts/select";

export async function getWeeklyProgress(
  userId?: string,
): Promise<WeeklyProgress[]> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new UserActionError(
        "UNAUTHORIZED",
        "No active session found",
        "getWeeklyProgress",
      );
    }

    if (!userId || userId !== session.user.id) {
      throw new UserActionError(
        "UNAUTHORIZED",
        "User ID mismatch or missing",
        "getWeeklyProgress",
      );
    }

    const userIdNum = parseInt(userId);

    const weeklyProgress = await selectUserWeeklyProgress(userIdNum);

    return weeklyProgress;
  } catch (error) {
    console.error("Error in getWeeklyProgress:", error);

    if (error instanceof UserActionError) {
      throw error;
    }
    throw new UserActionError(
      "DATABASE_ERROR",
      "Failed to fetch weekly progress",
      "getWeeklyProgress",
    );
  }
}

export async function getCategoryPerformance(
  userId?: string,
): Promise<CategoryPerformance[]> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new UserActionError(
        "UNAUTHORIZED",
        "No active session found",
        "getCategoryPerformance",
      );
    }

    if (!userId || userId !== session.user.id) {
      throw new UserActionError(
        "UNAUTHORIZED",
        "User ID mismatch or missing",
        "getCategoryPerformance",
      );
    }

    const userIdNum = parseInt(userId);

    const categoryPerformances = await selectUserCategoryPerformance(userIdNum);

    return categoryPerformances;
  } catch (error) {
    console.error("Error in getCategoryPerformance:", error);
    if (error instanceof UserActionError) {
      throw error;
    }
    throw new UserActionError(
      "DATABASE_ERROR",
      "Failed to fetch category performance",
      "getCategoryPerformance",
    );
  }
}
