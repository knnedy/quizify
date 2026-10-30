import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { canCreateQuizzes, isAdmin, isStaff, toRole } from "@/lib/roles";
import { auth, type Session } from "@/server/auth";

export const getSession = cache(async (): Promise<Session | null> => {
  return auth.api.getSession({ headers: await headers() });
});

// Better Auth types user ids as strings, but our columns are integers, and it
// types the role as a plain string. Converting both once here means nothing
// else has to think about it.
export async function getOptionalUser() {
  const session = await getSession();
  if (!session) return null;

  return {
    ...session.user,
    id: Number(session.user.id),
    role: toRole(session.user.role),
  };
}

export type SessionUser = NonNullable<
  Awaited<ReturnType<typeof getOptionalUser>>
>;

// For pages: redirects to sign-in and returns the user otherwise.
export async function requireUser(redirectTo: string): Promise<SessionUser> {
  const user = await getOptionalUser();
  if (!user) {
    redirect(`/sign-in?redirect=${encodeURIComponent(redirectTo)}`);
  }
  return user;
}

// Moderators and admins. Anyone else gets a 404 rather than a forbidden page,
// so the admin area does not confirm that it exists.
export async function requireStaff(redirectTo: string): Promise<SessionUser> {
  const user = await requireUser(redirectTo);
  if (!isStaff(user.role)) notFound();
  return user;
}

export async function requireAdmin(redirectTo: string): Promise<SessionUser> {
  const user = await requireUser(redirectTo);
  if (!isAdmin(user.role)) notFound();
  return user;
}

// Creators, moderators and admins. Everyone else lands on My quizzes, which
// shows the creator application.
export async function requireCreator(redirectTo: string): Promise<SessionUser> {
  const user = await requireUser(redirectTo);
  if (!canCreateQuizzes(user.role)) redirect("/my-quizzes");
  return user;
}
