"use server";

import "server-only";
import { isStaff } from "@/lib/roles";
import { getOptionalUser } from "@/server/session";
import type { ActionResult } from "@/types/actions";

// Called right after signing in on the admin host. An account that is not
// staff is told so, and the sign-in form ends its session again.
export async function confirmStaffAccess(): Promise<ActionResult> {
  const user = await getOptionalUser();

  if (!user || !isStaff(user.role)) {
    return {
      ok: false,
      error: "This account doesn't have access to the admin area.",
    };
  }

  return { ok: true };
}
