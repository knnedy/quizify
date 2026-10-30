import type { CreatorOverview } from "../mock-data";
import { CreatorActivityFeed } from "./creator-activity";
import { CreatorQuizzes } from "./creator-quizzes";
import { CreatorSummary } from "./creator-summary";
import { DraftsCard } from "./drafts-card";
import { PlaysChart } from "./plays-chart";

export function CreatingView({ creator }: { creator: CreatorOverview }) {
  return (
    <div className="space-y-8">
      <CreatorSummary creator={creator} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
        <div className="space-y-6">
          <PlaysChart series={creator.series} />
          <CreatorQuizzes quizzes={creator.quizzes} />
        </div>
        <div className="space-y-6">
          <DraftsCard drafts={creator.drafts} />
          <CreatorActivityFeed entries={creator.activity} />
        </div>
      </div>
    </div>
  );
}
