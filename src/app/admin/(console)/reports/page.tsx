import type { Metadata } from "next";
import { AdminPage } from "../_components/admin-page";
import { ReportsWorkspace } from "./_components/reports-workspace";
import { getReports } from "./mock-data";

export const metadata: Metadata = { title: "Reports" };

export default async function ReportsPage() {
  const { items } = await getReports();

  return (
    <AdminPage
      title="Reports"
      description="Players flag quizzes. Read what they said and decide what happens to the quiz.">
      <ReportsWorkspace items={items} />
    </AdminPage>
  );
}
