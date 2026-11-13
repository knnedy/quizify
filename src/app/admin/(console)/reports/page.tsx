import type { Metadata } from "next";
import { getReports } from "@/server/queries/admin-reports";
import { requireStaff } from "@/server/session";
import { AdminPage } from "../_components/admin-page";
import { ReportsWorkspace } from "./_components/reports-workspace";

export const metadata: Metadata = { title: "Reports" };

export default async function ReportsPage() {
  await requireStaff("/reports");
  const { open, resolved, counts } = await getReports();

  return (
    <AdminPage
      title="Reports"
      description="Players flag quizzes. Read what they said and decide what happens to the quiz.">
      <ReportsWorkspace open={open} resolved={resolved} counts={counts} />
    </AdminPage>
  );
}
