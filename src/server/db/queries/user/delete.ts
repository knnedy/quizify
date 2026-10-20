"use server";

import db from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const deleteUserById = async (userId: number) => {
  await db.delete(users).where(eq(users.id, userId));
};
