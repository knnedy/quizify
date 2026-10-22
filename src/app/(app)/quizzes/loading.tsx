import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function QuizzesLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 py-4">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col space-y-4">
          {/* Header Section */}
          <div className="flex flex-col space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-7 w-36" />
                <Skeleton className="h-6 w-12 rounded-md" />
              </div>

              <Skeleton className="h-10 w-full sm:w-64 rounded-md" />
            </div>

            {/* Search and Filter Section */}
            <div className="bg-background/80 shadow-sm border rounded-lg p-3">
              <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                <div className="relative flex-1 w-full">
                  <Skeleton className="h-9 w-full" />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Skeleton className="h-9 w-32" />
                  <Skeleton className="h-9 w-40" />
                </div>
              </div>
            </div>
          </div>

          {/* Quiz Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Card
                key={item}
                className="h-full flex flex-col transition-all duration-300 overflow-hidden bg-gradient-to-br from-card to-card/80">
                <CardHeader className="pb-4 space-y-3">
                  {/* Top row with difficulty, category, and bookmark */}
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>

                  {/* Title and description */}
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>

                  {/* Rating display */}
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Skeleton key={i} className="h-3.5 w-3.5 rounded-sm" />
                      ))}
                    </div>
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </CardHeader>

                <CardContent className="pb-4 pt-0 space-y-4 flex-grow">
                  <Separator className="opacity-30" />

                  {/* Quiz stats grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gradient-to-br from-muted/30 to-muted/50 border border-border/50">
                      <Skeleton className="h-4 w-4" />
                      <div className="text-center space-y-1">
                        <Skeleton className="h-4 w-8" />
                        <Skeleton className="h-3 w-10" />
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gradient-to-br from-muted/30 to-muted/50 border border-border/50">
                      <Skeleton className="h-4 w-4" />
                      <div className="text-center space-y-1">
                        <Skeleton className="h-4 w-6" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gradient-to-br from-muted/30 to-muted/50 border border-border/50">
                      <Skeleton className="h-4 w-4" />
                      <div className="text-center space-y-1">
                        <Skeleton className="h-4 w-8" />
                        <Skeleton className="h-3 w-14" />
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-0 pb-4">
                  <Skeleton className="w-full h-10 rounded-md" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
