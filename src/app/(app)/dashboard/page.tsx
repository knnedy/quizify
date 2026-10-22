import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { headers } from "next/headers";
import DashboardContent from "./components/dashboard-content";
import { getUserStats } from "@/server/actions/user/stats";
import {
  getCategoryPerformance,
  getWeeklyProgress,
} from "@/server/actions/user/analytics";
import { tryCatch } from "@/lib/try-catch";
import { getRecentQuizAttempts } from "@/server/actions/quiz/attempt";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const { data: userStats, error: userStatsError } = await tryCatch(
    getUserStats(session.user.id),
  );
  if (userStatsError) {
    throw new Error(userStatsError.message);
  }

  const { data: recentQuizzes, error: recentQuizzesError } = await tryCatch(
    getRecentQuizAttempts(session.user.id, 3),
  );
  if (recentQuizzesError) {
    throw new Error(recentQuizzesError.message);
  }

  const { data: categoryPerformance, error: categoryPerformanceError } =
    await tryCatch(getCategoryPerformance(session.user.id));
  if (categoryPerformanceError) {
    throw new Error(categoryPerformanceError.message);
  }

  const { data: weeklyProgress, error: weeklyProgressError } = await tryCatch(
    getWeeklyProgress(session.user.id),
  );
  if (weeklyProgressError) {
    throw new Error(weeklyProgressError.message);
  }

  return (
    <DashboardContent
      session={session}
      stats={userStats}
      recentQuizzes={recentQuizzes}
      categoryPerformance={categoryPerformance}
      weeklyProgress={weeklyProgress}
    />
  );
}
