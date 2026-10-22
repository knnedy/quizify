import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function QuizDetailsLoading() {
  return (
    <div className="container mx-auto py-4 px-2 sm:py-8 sm:px-4 max-w-4xl">
      {/* Back Button */}
      <div className="mb-4 block">
        <Skeleton className="h-9 w-32" />
      </div>

      {/* Main Quiz Card */}
      <Card className="mb-6 sm:mb-8">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-5 w-1/2" />
            </div>
            <div className="flex flex-col gap-2 w-full sm:min-w-[140px] sm:w-auto">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-4 w-32 self-center" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {/* Quiz Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-6">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="flex flex-col items-center p-2 sm:p-4 bg-muted/50 rounded-xl">
                <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mb-2" />
                <Skeleton className="h-4 w-16 mb-1" />
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>

          {/* Best Performance Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 sm:p-5 mb-6">
            <Skeleton className="h-6 w-48 mb-3" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="bg-white/80 rounded-lg p-2 sm:p-3">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-6 w-full mb-1" />
                  <Skeleton className="h-1.5 w-full" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4 w-full justify-start bg-muted/50 p-1 rounded-xl">
          {["overview", "attempts", "leaderboard"].map((tab) => (
            <TabsTrigger key={tab} value={tab} className="rounded-lg">
              <Skeleton className="h-5 w-20 mr-2" />
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Overview Tab Content */}
        <TabsContent value="overview" className="mt-0">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {[1, 2].map((item) => (
                    <div key={item}>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  {[1, 2].map((item) => (
                    <div key={item}>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardContent className="flex justify-center">
              <Skeleton className="h-10 w-32" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attempts Tab Content */}
        <TabsContent value="attempts" className="mt-0">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border overflow-hidden">
                <ScrollArea className="w-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {[
                          "Date",
                          "Score",
                          "Time Taken",
                          "XP Earned",
                          "Actions",
                        ].map((header) => (
                          <TableHead key={header}>
                            <Skeleton className="h-4 w-16" />
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[1, 2, 3].map((row) => (
                        <TableRow key={row}>
                          {[1, 2, 3, 4, 5].map((cell) => (
                            <TableCell key={cell}>
                              <Skeleton className="h-6 w-16" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            </CardContent>
            <CardContent className="flex justify-center">
              <Skeleton className="h-10 w-32" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leaderboard Tab Content */}
        <TabsContent value="leaderboard" className="mt-0">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border overflow-hidden">
                <ScrollArea className="w-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {["Rank", "User", "Score", "Time", "XP Earned"].map(
                          (header) => (
                            <TableHead key={header}>
                              <Skeleton className="h-4 w-16" />
                            </TableHead>
                          )
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[1, 2, 3, 4, 5].map((row) => (
                        <TableRow key={row}>
                          {[1, 2, 3, 4, 5].map((cell) => (
                            <TableCell key={cell}>
                              <Skeleton className="h-6 w-16" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            </CardContent>
            <CardContent className="flex justify-center">
              <Skeleton className="h-10 w-32" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
