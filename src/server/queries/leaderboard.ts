import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/server/db";
import { quizAttempts, users } from "@/server/db/schema";
import type { LeaderboardEntry, LeaderboardView } from "@/types/quiz";
import { finishedAttempt } from "./attempt-filters";

const TOP_COUNT = 5;

type LeaderboardRow = {
  rank: number;
  score: number;
  timeTaken: number;
  userId: number;
  name: string;
};

// Best attempt per player: highest score, then the faster time, then the
// earlier finish. The viewer's own row comes back even outside the top.
export async function getQuizLeaderboard(
  quizId: number,
  viewerId?: number,
): Promise<LeaderboardView & { you: LeaderboardEntry | null }> {
  const includeViewer =
    viewerId === undefined ? sql`` : sql`or ranked.user_id = ${viewerId}`;

  const rows = await db.execute<LeaderboardRow>(sql`
    select
      ranked.rank::int as "rank",
      ranked.score as "score",
      ranked.time_taken as "timeTaken",
      ranked.user_id as "userId",
      ${users.name} as "name"
    from (
      select
        best.user_id,
        best.score,
        best.time_taken,
        row_number() over (
          order by best.score desc, best.time_taken asc,
            best.completed_at asc, best.user_id asc
        ) as rank
      from (
        select distinct on (${quizAttempts.userId})
          ${quizAttempts.userId} as user_id,
          ${quizAttempts.score} as score,
          ${quizAttempts.timeTaken} as time_taken,
          ${quizAttempts.completedAt} as completed_at
        from ${quizAttempts}
        where ${quizAttempts.quizId} = ${quizId} and ${finishedAttempt}
        order by ${quizAttempts.userId}, ${quizAttempts.score} desc,
          ${quizAttempts.timeTaken} asc, ${quizAttempts.completedAt} asc
      ) as best
    ) as ranked
    inner join ${users} on ${users.id} = ranked.user_id
    where ranked.rank <= ${sql.raw(String(TOP_COUNT))} ${includeViewer}
    order by ranked.rank
  `);

  const entries: LeaderboardEntry[] = rows.map((row) => ({
    rank: row.rank,
    name: row.name,
    score: row.score,
    timeSeconds: row.timeTaken,
    isYou: viewerId !== undefined && row.userId === viewerId,
  }));

  return {
    top: entries.filter((entry) => entry.rank <= TOP_COUNT),
    pinned:
      entries.find((entry) => entry.isYou && entry.rank > TOP_COUNT) ?? null,
    you: entries.find((entry) => entry.isYou) ?? null,
  };
}
