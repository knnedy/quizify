import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSafeRedirect } from "@/lib/safe-redirect";
import { getOptionalUser } from "@/server/session";
import { SignInForm } from "./_components/sign-in-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string | string[] }>;
}) {
  const { redirect: redirectParam } = await searchParams;
  const raw = Array.isArray(redirectParam) ? redirectParam[0] : redirectParam;
  const redirectTo = getSafeRedirect(raw);

  // A banned user still holding a session counts as signed out here, so they
  // can't bounce between this page and the dashboard
  const user = await getOptionalUser();
  if (user) redirect(redirectTo);

  const query =
    redirectTo === "/dashboard"
      ? ""
      : `?redirect=${encodeURIComponent(redirectTo)}`;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl">Welcome back</h1>
        <p className="text-base text-muted-foreground">
          Sign in to keep your streak going and pick up where you left off.
        </p>
      </div>

      <SignInForm redirectTo={redirectTo} />

      <div className="space-y-3 text-center text-sm text-muted-foreground">
        <p>
          New to Quizify?{" "}
          <Link
            href={`/sign-up${query}`}
            className="font-medium text-foreground underline-offset-4 hover:underline">
            Create an account
          </Link>
        </p>
        <p>
          Just looking?{" "}
          <Link
            href="/quizzes"
            className="font-medium text-foreground underline-offset-4 hover:underline">
            Browse quizzes
          </Link>{" "}
          without an account.
        </p>
      </div>
    </div>
  );
}
