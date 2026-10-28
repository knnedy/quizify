import type { Metadata } from "next";
import { AdminPage } from "../_components/admin-page";
import { ApplicationsWorkspace } from "./_components/applications-workspace";
import { getApplications, type ApplicationStatus } from "./mock-data";

export const metadata: Metadata = { title: "Creator applications" };

const statuses: ApplicationStatus[] = ["PENDING", "APPROVED", "REJECTED"];

export default async function ApplicationsPage() {
  // The workspace decides and re-sorts on the client, so it gets every
  // application at once. The real query is one list call.
  const results = await Promise.all(
    statuses.map((status) => getApplications({ status })),
  );
  const applications = results.flatMap((result) => result.items);

  return (
    <AdminPage
      title="Creator applications"
      description="Read each answer and decide who can publish quizzes. The longest waiting come first.">
      <ApplicationsWorkspace applications={applications} />
    </AdminPage>
  );
}
