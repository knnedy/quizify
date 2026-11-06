import type { Metadata } from "next";
import { AdminPage } from "../_components/admin-page";
import { adminIdentity } from "../mock-data";
import { ActivityPanel } from "./_components/activity-panel";
import { AttentionCards } from "./_components/attention-cards";
import { LibraryCard } from "./_components/library-card";
import { PlatformTotals } from "./_components/platform-totals";
import { RecentActivity } from "./_components/recent-activity";
import { TopQuizzesCard } from "./_components/top-quizzes-card";
import { TopicsCard } from "./_components/topics-card";
import { getOverview } from "./mock-data";

export const metadata: Metadata = { title: "Overview" };

export default async function AdminOverviewPage() {
  const overview = await getOverview();
  const firstName = adminIdentity.name.split(" ")[0];

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
