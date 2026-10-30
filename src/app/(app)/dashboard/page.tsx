import type { Metadata } from "next";
import { requireUser } from "@/server/session";
import { AttentionBanner } from "./_components/attention-banner";
import { CreatingView } from "./_components/creating-view";
import { DashboardHero } from "./_components/dashboard-hero";
import { DashboardTabs } from "./_components/dashboard-tabs";
import { PlayingView } from "./_components/playing-view";
import {
  getDashboard,
  parsePreview,
  type Dashboard,
  type DashboardView,
  type Preview,
} from "./mock-data";

export const metadata: Metadata = { title: "Dashboard" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

// Keeps the dev ?as= param when switching views, so the tabs stay on the
// account state you are previewing.
function dashboardHref(view: DashboardView, preview: Preview | null) {
  const params = new URLSearchParams();
  if (preview) params.set("as", preview);
  if (view === "creating") params.set("view", "creating");

  const query = params.toString();
  return query ? `/dashboard?${query}` : "/dashboard";
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
  const raw = await searchParams;
  await requireUser("/dashboard");

  const explicit = parsePreview(first(raw.as));
  const data = await getDashboard(explicit ?? "creator");

  const view: DashboardView =
    data.creator && first(raw.view) === "creating" ? "creating" : "playing";
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
              playing: dashboardHref("playing", explicit),
              creating: dashboardHref("creating", explicit),
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
