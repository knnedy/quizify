import { stats } from "./mock-data";

const format = new Intl.NumberFormat("en-US");

export default function StatsSection() {
  return (
    <section aria-label="Quizify in numbers" className="border-b">
      <dl className="mx-auto grid max-w-6xl grid-cols-1 divide-y px-6 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col-reverse items-center gap-1 py-7">
            <dt className="text-sm text-muted-foreground">{stat.label}</dt>
            <dd className="font-display text-4xl font-bold tabular-nums">
              {format.format(stat.value)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
