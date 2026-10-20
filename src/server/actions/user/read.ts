"use server";

import { auth } from "@/server/auth";
import { selectUserById } from "@/server/db/queries/user/select";
import { UserActionError } from "@/server/utils/error";
import { headers } from "next/headers";

export const getUserById = async (userId?: string) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new UserActionError(
        "UNAUTHORIZED",
        "No active session found",
        "getUserById",
      );
    }

    if (!userId || userId !== session.user.id) {
      throw new UserActionError(
        "UNAUTHORIZED",
        "User ID mismatch or missing",
        "getUserById",
      );
    }

    const userIdNum = parseInt(userId);

    const user = await selectUserById(userIdNum);
    if (!user) {
      throw new UserActionError("NOT_FOUND", "User not found", "getUserById");
    }

    return user;
  } catch (error) {
    console.error("Error in getUserById:", error);
    if (error instanceof UserActionError) {
      throw error;
    }
    throw new UserActionError(
      "DATABASE_ERROR",
      "Failed to fetch quizzes",
      "getUserById",
    );
  }
};
