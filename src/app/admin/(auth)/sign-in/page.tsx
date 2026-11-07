import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldCheckIcon } from "lucide-react";
import { isStaff } from "@/lib/roles";
import { getSafeRedirect } from "@/lib/safe-redirect";
import { appUrl } from "@/lib/site-urls";
import { getOptionalUser } from "@/server/session";
import { AdminSignInForm } from "./_components/admin-sign-in-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function AdminSignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string | string[] }>;
}) {
  const { redirect: redirectParam } = await searchParams;
  const raw = Array.isArray(redirectParam) ? redirectParam[0] : redirectParam;
  const redirectTo = getSafeRedirect(raw, "/");

  // Already signed in as staff: nothing to do here
  const user = await getOptionalUser();
  if (user && isStaff(user.role)) redirect(redirectTo);

  return (
    <div className="space-y-8">
      <div className="space-y-5">
        <span
          aria-hidden
          className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-primary">
          <ShieldCheckIcon className="size-6" />
        </span>
        <div className="space-y-2">
          <h1 className="text-3xl">Admin sign in</h1>
          <p className="text-base text-muted-foreground">
            Use your staff account. This sign-in is separate from the main site.
          </p>
        </div>
      </div>

      <AdminSignInForm redirectTo={redirectTo} />

      <p className="text-center text-sm text-muted-foreground">
        Not staff?{" "}
        <a
          href={appUrl}
          className="font-medium text-foreground underline-offset-4 hover:underline">
          Go to Quizify
        </a>
      </p>
    </div>
  );
}
