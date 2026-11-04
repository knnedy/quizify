import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { dashboardParamsSchema } from "@/lib/schemas/dashboard";
import { getDashboard } from "@/server/queries/dashboard";
import { requireUser } from "@/server/session";
import type { Dashboard, DashboardView } from "@/types/dashboard";
import { AttentionBanner } from "./_components/attention-banner";
import { CreatingView } from "./_components/creating-view";
import { DashboardHero } from "./_components/dashboard-hero";
import { DashboardTabs } from "./_components/dashboard-tabs";
import { PlayingView } from "./_components/playing-view";

export const metadata: Metadata = { title: "Dashboard" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function dashboardHref(view: DashboardView) {
  return view === "creating" ? "/dashboard?view=creating" : "/dashboard";
}

function getHeroCopy(data: Dashboard, view: DashboardView) {
  if (view === "creating") {
    return {
      title: `Welcome back, ${data.firstName}`,
      text: "Here is how your quizzes are doing.",
    };
  }

  if (data.isNew) {
    return {
      title: `Welcome to Quizify, ${data.firstName}`,
      text: "Play your first quiz to start a streak and earn XP.",
    };
  }

  const { thisWeek } = data.stats;
  return {
    title: `Welcome back, ${data.firstName}`,
    text:
      thisWeek > 0
        ? `You've played ${thisWeek} ${thisWeek === 1 ? "quiz" : "quizzes"} this week. Keep it going.`
        : "Pick a quiz to get your week started.",
  };
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [raw, user] = await Promise.all([
    searchParams,
    requireUser("/dashboard"),
  ]);
  const { view: requested } = dashboardParamsSchema.parse(raw);

  const data = await getDashboard(user);
  if (!data) notFound();

  // Only creators have a creating view
  const view: DashboardView =
    data.creator && requested === "creating" ? "creating" : "playing";
  const attention = data.creator?.attention ?? [];
  const hero = getHeroCopy(data, view);

  return (
    <main>
      <DashboardHero
        title={hero.title}
        text={hero.text}
        xp={data.totalXp}
        canCreate={data.isCreator}>
        {data.creator && (
          <DashboardTabs
            active={view}
            hrefs={{
              playing: dashboardHref("playing"),
              creating: dashboardHref("creating"),
            }}
            attention={attention.length > 0}
          />
        )}
      </DashboardHero>

      <div className="mx-auto max-w-6xl space-y-8 px-6 py-10">
        <AttentionBanner items={attention} />

        {view === "creating" && data.creator ? (
          <CreatingView creator={data.creator} />
        ) : (
          <PlayingView data={data} />
        )}
      </div>
    </main>
  );
}
