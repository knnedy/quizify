"use server";

import { auth } from "@/server/auth";
import { updateUserById } from "@/server/db/queries/user/update";
import { UserActionError } from "@/server/utils/error";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export const updateUserProfile = async (
  userId: number,
  profileData: {
    name: string;
    email: string;
    socialLinks: {
      platform: string;
      url: string;
    }[];
  },
): Promise<{ id: number }> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new UserActionError(
        "UNAUTHORIZED",
        "No active session found",
        "updateUserProfile",
      );
    }

    if (!userId || userId !== Number(session.user.id)) {
      throw new UserActionError(
        "UNAUTHORIZED",
        "User ID mismatch or missing",
        "updateUserProfile",
      );
    }

    const updatedUser = await updateUserById(userId, profileData);
    if (!updatedUser) {
      throw new UserActionError(
        "NOT_FOUND",
        "Failed to update user profile",
        "updateUserProfile",
      );
    }

    revalidatePath("/settings");
    return updatedUser;
  } catch (error) {
    console.error("Error in updateUserProfile:", error);

    if (error instanceof UserActionError) {
      throw error;
    }

    throw new UserActionError(
      "DATABASE_ERROR",
      "Failed to update user profile. Please try again later.",
      "updateUserProfile",
    );
  }
};
