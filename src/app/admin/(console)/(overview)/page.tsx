import type { Metadata } from "next";
import { isAdmin } from "@/lib/roles";
import { getOverview } from "@/server/queries/admin-overview";
import { requireStaff } from "@/server/session";
import { AdminPage } from "../_components/admin-page";
import { ActivityPanel } from "./_components/activity-panel";
import { AttentionCards } from "./_components/attention-cards";
import { LibraryCard } from "./_components/library-card";
import { PlatformTotals } from "./_components/platform-totals";
import { RecentActivity } from "./_components/recent-activity";
import { TopQuizzesCard } from "./_components/top-quizzes-card";
import { TopicsCard } from "./_components/topics-card";

export const metadata: Metadata = { title: "Overview" };

export default async function AdminOverviewPage() {
  const staff = await requireStaff("/");
  const overview = await getOverview({
    staffId: staff.id,
    includeApplications: isAdmin(staff.role),
  });
  const firstName = staff.name.split(" ")[0] ?? staff.name;

  return (
    <AdminPage
      fill={false}
      title={`Welcome back, ${firstName}`}
      description="Here is what needs you today, and how Quizify is doing.">
      <AttentionCards items={overview.attention} />
      <PlatformTotals totals={overview.totals} />
      <ActivityPanel days={overview.days} />

      <div className="grid gap-6 lg:grid-cols-2">
        <TopicsCard topics={overview.topics} />
        <LibraryCard slices={overview.library} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TopQuizzesCard quizzes={overview.topQuizzes} />
        <RecentActivity entries={overview.activity} />
      </div>
    </AdminPage>
  );
}
