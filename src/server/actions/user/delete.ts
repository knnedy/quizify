"use server";

import { auth } from "@/server/auth";
import { deleteUserById } from "@/server/database/queries/user/delete";
import { UserActionError } from "@/server/utils/error";
import { headers } from "next/headers";

export const deleteUserAccount = async (
  userId: string,
): Promise<{ success: boolean }> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new UserActionError(
        "UNAUTHORIZED",
        "No active session found",
        "deleteUserAccount",
      );
    }

    if (!userId || userId !== session.user.id) {
      throw new UserActionError(
        "UNAUTHORIZED",
        "User ID mismatch or missing",
        "deleteUserAccount",
      );
    }

    await deleteUserById(parseInt(userId));

    return { success: true };
  } catch (error) {
    console.error("Error in deleteUserAccount:", error);

    if (error instanceof UserActionError) {
      throw error;
    }

    throw new UserActionError(
      "DATABASE_ERROR",
      "Failed to delete user account. Please try again later.",
      "deleteUserAccount",
    );
  }
};
