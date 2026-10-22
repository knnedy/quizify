import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { ArrowLeft, Eye } from "lucide-react";

export default function QuizReviewLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 py-4 sm:py-6">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" className="h-10 gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Badge variant="outline" className="h-10 gap-2 px-4">
              <Eye className="w-4 h-4" />
              Review Mode
            </Badge>
          </div>

          {/* Quiz Info Card */}
          <Card className="bg-white/50 backdrop-blur-xl shadow-lg">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
                {[1, 2, 3, 4].map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-primary/5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg">
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Question Card */}
          <Card className="bg-white/50 backdrop-blur-xl shadow-lg">
            <CardHeader className="border-b border-border/40">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="h-2 w-full" />
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <Skeleton className="h-6 w-3/4 mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
                  {[1, 2, 3, 4].map((_, index) => (
                    <Skeleton key={index} className="h-12 sm:h-14 w-full" />
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-border/40 mt-6">
              <div className="flex flex-col sm:flex-row justify-between items-center w-full pt-4 gap-4">
                <Skeleton className="h-10 w-full sm:w-24" />
                <Skeleton className="h-10 w-full sm:w-24" />
                <Skeleton className="h-10 w-full sm:w-24" />
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
