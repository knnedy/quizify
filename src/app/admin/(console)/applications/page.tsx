import type { Metadata } from "next";
import { getApplications } from "@/server/queries/admin-applications";
import { requireAdmin } from "@/server/session";
import { AdminPage } from "../_components/admin-page";
import { ApplicationsWorkspace } from "./_components/applications-workspace";

export const metadata: Metadata = { title: "Creator applications" };

export default async function ApplicationsPage() {
  // Only admins decide on applications. Anyone else gets a 404.
  await requireAdmin("/applications");
  const { applications, counts } = await getApplications();

  return (
    <AdminPage
      title="Creator applications"
      description="Read each answer and decide who can publish quizzes. The longest waiting come first.">
      <ApplicationsWorkspace applications={applications} counts={counts} />
    </AdminPage>
  );
}
