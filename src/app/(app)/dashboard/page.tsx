import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { headers } from "next/headers";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return <div className="test3xl">Dashboard</div>;
}
