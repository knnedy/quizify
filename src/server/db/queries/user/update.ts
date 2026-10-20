"use server";

import db from "@/server/db";
import { eq } from "drizzle-orm";
import { users } from "@/server/db/schema";

export const updateUserById = async (
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
  const { name, email, socialLinks } = profileData;
  const result = await db
    .update(users)
    .set({
      name: name,
      email: email,
      socialLinks: socialLinks,
    })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
    });

  return result[0];
};

type StreakUpdateData = {
  lastActivityDate?: Date;
  currentStreak?: number;
  bestStreak?: number;
};

export const updateUserStreakData = async (
  userId: number,
  data: StreakUpdateData,
): Promise<void> => {
  await db.update(users).set(data).where(eq(users.id, userId));
};

export const updateUserTotalXP = async (
  userId: number,
  totalXP: number,
): Promise<void> => {
  await db.update(users).set({ totalXp: totalXP }).where(eq(users.id, userId));
};
