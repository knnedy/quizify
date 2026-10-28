import type { Metadata } from "next";
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
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-8 sm:py-10">
      <header className="space-y-2">
        <h1 className="text-3xl sm:text-4xl">Creator applications</h1>
        <p className="max-w-prose text-muted-foreground">
          Read each answer and decide who can publish quizzes. The longest
          waiting applications come first.
        </p>
      </header>

      <ApplicationsWorkspace applications={applications} />
    </main>
  );
}
