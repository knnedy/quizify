import type { PublicStats } from "@/types/stats";

const format = new Intl.NumberFormat("en-US");

function label(count: number, one: string, many: string) {
  return count === 1 ? one : many;
}

export default function StatsSection({ stats }: { stats: PublicStats }) {
  const items = [
    {
      value: stats.quizzes,
      label: label(stats.quizzes, "quiz to play", "quizzes to play"),
    },
    {
      value: stats.players,
      label: label(stats.players, "player", "players"),
    },
    {
      value: stats.questionsAnswered,
      label: label(
        stats.questionsAnswered,
        "question answered",
        "questions answered",
      ),
    },
  ];

  if (items.every((item) => item.value === 0)) return null;

  return (
    <section aria-label="Quizify in numbers" className="border-b">
      <dl className="mx-auto grid max-w-6xl grid-cols-1 divide-y px-6 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex flex-col-reverse items-center gap-1 py-7">
            <dt className="text-sm text-muted-foreground">{item.label}</dt>
            <dd className="font-display text-4xl font-bold tabular-nums">
              {format.format(item.value)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
