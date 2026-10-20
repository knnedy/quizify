"use server";

import { UserActionError } from "@/server/utils/error";
import { selectUserById } from "@/server/db/queries/user/select";
import { updateUserTotalXP } from "@/server/db/queries/user/update";

export async function updateUserXP(
  userId: number,
  xpEarned: number,
): Promise<number> {
  try {
    const user = await selectUserById(userId);

    if (!user) {
      throw new UserActionError("NOT_FOUND", "User not found", "updateUserXP");
    }

    const newTotalXp = user.totalXp + xpEarned;

    await updateUserTotalXP(userId, newTotalXp);

    return newTotalXp;
  } catch (error) {
    console.error("Error in updateUserXP:", error);

    if (error instanceof UserActionError) {
      throw error;
    }

    throw new UserActionError(
      "DATABASE_ERROR",
      "Failed to update user XP. Please try again later.",
      "updateUserXP",
    );
  }
}
