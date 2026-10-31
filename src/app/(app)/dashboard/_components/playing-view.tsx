import Link from "next/link";
import { QuizCard } from "@/components/quiz/quiz-card";
import type { Dashboard } from "../mock-data";
import { AchievementsCard } from "./achievements-card";
import { BecomeCreatorCard } from "./become-creator-card";
import { PlayNextCard } from "./play-next-card";
import { RecentResults } from "./recent-results";
import { SavedQuizzes } from "./saved-quizzes";
import { StatsStrip } from "./stats-strip";
import { StreakCard } from "./streak-card";
import { TopicScores } from "./topic-scores";

export function PlayingView({ data }: { data: Dashboard }) {
  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <PlayNextCard
          inProgress={data.inProgress}
          suggestion={data.suggestion}
          isNew={data.isNew}
        />
        <StreakCard streak={data.streak} />
      </div>

      <StatsStrip stats={data.stats} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
        <div className="space-y-6">
          <RecentResults results={data.recent} />
          <SavedQuizzes quizzes={data.saved} />
        </div>
        <div className="space-y-6">
          <TopicScores topics={data.topics} />
          <AchievementsCard achievements={data.achievements} />
        </div>
      </div>

      {data.picks.quizzes.length > 0 && (
        <section aria-labelledby="picks-heading" className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-1">
              <h2 id="picks-heading" className="text-2xl">
                {data.picks.title}
              </h2>
              <p className="text-sm text-muted-foreground">{data.picks.text}</p>
            </div>
            <Link
              href="/quizzes"
              className="shrink-0 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
              Browse all
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {data.picks.quizzes.map((quiz) => (
              <QuizCard key={quiz.slug} quiz={quiz} showBookmark />
            ))}
          </div>
        </section>
      )}

      {!data.isCreator && <BecomeCreatorCard eligibility={data.eligibility} />}
    </div>
  );
}
