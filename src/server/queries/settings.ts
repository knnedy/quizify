import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import type { SettingsUser } from "@/types/settings";

export async function getSettingsUser(
  userId: number,
): Promise<SettingsUser | null> {
  const [row] = await db
    .select({
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      timezone: users.timezone,
      totalXp: users.totalXp,
      socialLinks: users.socialLinks,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!row) return null;

  return {
    name: row.name,
    email: row.email,
    role: row.role,
    joinedAt: row.createdAt,
    timezone: row.timezone,
    totalXp: row.totalXp,
    links: {
      website: row.socialLinks.website ?? "",
      instagram: row.socialLinks.instagram ?? "",
      x: row.socialLinks.x ?? "",
    },
  };
}
