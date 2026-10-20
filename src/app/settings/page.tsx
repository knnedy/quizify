import { auth } from "@/server/auth";
import SettingsForm from "./components/settings-form";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { tryCatch } from "@/lib/try-catch";
import { getUserById } from "@/server/actions/user/read";

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const { data: user, error: userError } = await tryCatch(
    getUserById(session.user.id),
  );
  if (userError) {
    throw new Error(userError.message);
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      <div className="grid gap-10 pt-6">
        <SettingsForm user={user} session={session} />
      </div>
    </>
  );
}
