import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 py-8">
      <div className="container mx-auto px-4">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <Skeleton className="h-10 w-2/3 mx-auto mb-2" />
          <Skeleton className="h-6 w-1/2 mx-auto" />
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              {/* Stats Cards */}
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="space-y-2">
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                ))}
              </div>

              {/* Recent Quizzes and Quick Actions */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Recent Quizzes */}
                <div className="md:col-span-2 space-y-4">
                  <Skeleton className="h-10 w-1/2" />
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="space-y-2">
                      <Skeleton className="h-20 w-full" />
                    </div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="space-y-4">
                  <Skeleton className="h-10 w-1/2" />
                  {[1, 2, 3, 4].map((item) => (
                    <Skeleton key={item} className="h-12 w-full" />
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Progress Tab Loading */}
            <TabsContent value="progress" className="grid md:grid-cols-2 gap-5">
              <Skeleton className="h-[400px] w-full" />
              <Skeleton className="h-[400px] w-full" />
            </TabsContent>

            {/* Achievements Tab Loading */}
            <TabsContent value="achievements" className="space-y-8">
              <div className="space-y-4">
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-[300px] w-full" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-10 w-1/2" />
                <div className="grid md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="space-y-2">
                      <Skeleton className="h-4 w-1/2 mb-2" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
