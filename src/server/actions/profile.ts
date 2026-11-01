"use server";

import "server-only";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  profileSchema,
  timezoneSchema,
  type ProfileValues,
  type TimezoneInput,
} from "@/lib/schemas/settings";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { getOptionalUser } from "@/server/session";
import type { ActionResult } from "@/types/actions";

const SOMETHING_WRONG = "Something went wrong. Please try again.";

export async function updateProfile(
  input: ProfileValues,
): Promise<ActionResult> {
  const user = await getOptionalUser();
  if (!user) return { ok: false, error: "Sign in to edit your profile." };

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Check your details and try again." };
  }
  const { name, website, instagram, x } = parsed.data;

  // Empty links are left out instead of stored as empty strings
  const socialLinks: { website?: string; instagram?: string; x?: string } = {};
  if (website) socialLinks.website = website;
  if (instagram) socialLinks.instagram = instagram;
  if (x) socialLinks.x = x;

  try {
    await db
      .update(users)
      .set({ name, socialLinks })
      .where(eq(users.id, user.id));

    // The name shows in the header menu, so the whole app refreshes
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    console.error("updateProfile failed", error);
    return { ok: false, error: SOMETHING_WRONG };
  }
}

export async function updateTimezone(
  input: TimezoneInput,
): Promise<ActionResult> {
  const user = await getOptionalUser();
  if (!user) return { ok: false, error: "Sign in to change your timezone." };

  const parsed = timezoneSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "That timezone isn't recognised." };
  }

  try {
    await db
      .update(users)
      .set({ timezone: parsed.data.timezone })
      .where(eq(users.id, user.id));

    return { ok: true };
  } catch (error) {
    console.error("updateTimezone failed", error);
    return { ok: false, error: SOMETHING_WRONG };
  }
}
