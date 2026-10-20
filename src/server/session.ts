import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth, type Session } from "@/server/auth";

export const getSession = cache(async (): Promise<Session | null> => {
  return auth.api.getSession({ headers: await headers() });
});

// Better Auth types user ids as strings, but our columns are integers.
// Converting once here means nothing else has to think about it.
export async function getOptionalUser() {
  const session = await getSession();
  if (!session) return null;
  return { ...session.user, id: Number(session.user.id) };
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
