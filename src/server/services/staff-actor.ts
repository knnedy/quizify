import "server-only";
import { isAdmin, isStaff } from "@/lib/roles";
import { getOptionalUser, type SessionUser } from "@/server/session";
import type { ActionResult } from "@/types/actions";

export type Actor = ActionResult<{ actor: SessionUser }>;

// Moderators and admins
export async function getStaffActor(): Promise<Actor> {
  const actor = await getOptionalUser();

  if (!actor || !isStaff(actor.role)) {
    return { ok: false, error: "You don't have access to that." };
  }
  return { ok: true, actor };
}

// Roles and creator applications are for admins only
export async function getAdminActor(): Promise<Actor> {
  const actor = await getOptionalUser();

  if (!actor || !isAdmin(actor.role)) {
    return { ok: false, error: "Only admins can do that." };
  }
  return { ok: true, actor };
}
