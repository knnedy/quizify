import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <main aria-busy="true">
      <p role="status" className="sr-only">
        Loading your dashboard
      </p>

      <section className="relative overflow-hidden border-b">
        <div className="relative mx-auto max-w-6xl space-y-8 px-6 py-10 sm:py-14">
          <div className="space-y-3">
            <Skeleton className="h-11 w-full max-w-md" />
            <Skeleton className="h-5 w-full max-w-sm" />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-8 px-6 py-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>

        <Skeleton className="h-24 rounded-2xl" />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
          <div className="space-y-6">
            <Skeleton className="h-72 rounded-2xl" />
            <Skeleton className="h-48 rounded-2xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-72 rounded-2xl" />
          </div>
        </div>
      </div>
    </main>
  );
}
