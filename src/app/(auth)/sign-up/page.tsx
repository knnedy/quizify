import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { getSafeRedirect } from "@/lib/safe-redirect";
import { SignUpForm } from "./_components/sign-up-form";

export const metadata: Metadata = { title: "Create account" };

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string | string[] }>;
}) {
  const { redirect: redirectParam } = await searchParams;
  const raw = Array.isArray(redirectParam) ? redirectParam[0] : redirectParam;
  const redirectTo = getSafeRedirect(raw);

  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect(redirectTo);

  const query =
    redirectTo === "/dashboard"
      ? ""
      : `?redirect=${encodeURIComponent(redirectTo)}`;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl">Create your account</h1>
        <p className="text-base text-muted-foreground">
          Join Quizify to take quizzes, earn XP and build your own.
        </p>
      </div>

      <SignUpForm redirectTo={redirectTo} />

      <div className="space-y-3 text-center text-sm text-muted-foreground">
        <p>
          Already have an account?{" "}
          <Link
            href={`/sign-in${query}`}
            className="font-medium text-foreground underline-offset-4 hover:underline">
            Sign in
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
