"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Clock,
  ArrowRight,
  Users,
  BookOpen,
  Star,
  Bookmark,
  Play,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { PublicQuizOverview } from "@/server/db/schema";
import { formatSecondsToMinutes } from "@/lib/format-time";
import { toast } from "sonner";
import { tryCatch } from "@/lib/try-catch";
import { toggleQuizBookmark } from "@/server/actions/quiz/bookmark";

type QuizCardProps = {
  quiz: PublicQuizOverview;
  diffConfig: {
    color: string;
    icon: string;
    bgColor: string;
  };
};

export default function QuizCard({ quiz, diffConfig }: QuizCardProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(quiz.isBookmarked);
  const [isPending, startTransition] = useTransition();

  const toggleBookmark = () => {
    // Optimistic update
    setIsBookmarked(!isBookmarked);

    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        toggleQuizBookmark(quiz.id),
      );

      if (error) {
        // Revert optimistic update
        setIsBookmarked(isBookmarked);
        toast.error("Failed to toggle bookmark");
        return;
      }

      // Sync with server state (in case of conflicts)
      setIsBookmarked(result.isBookmarked);
      toast.success(
        result.isBookmarked ? "Quiz bookmarked" : "Bookmark removed",
      );
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3.5 w-3.5 ${
          i < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : i < rating
              ? "fill-yellow-400/50 text-yellow-400"
              : "text-gray-300"
        }`}
      />
    ));
  };

  const isHovered = hoveredCard === quiz.id.toString();

  return (
    <Card
      className="group h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 overflow-hidden bg-gradient-to-br from-card to-card/80"
      onMouseEnter={() => setHoveredCard(quiz.id.toString())}
      onMouseLeave={() => setHoveredCard(null)}>
      <CardHeader className="pb-4 space-y-3">
        {/* Top row with difficulty, category, and bookmark */}
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="secondary"
              className={`${diffConfig.color} ${diffConfig.bgColor} px-2.5 py-1 text-xs font-semibold border-0 shadow-sm`}>
              {diffConfig.icon} {quiz.difficulty}
            </Badge>
            <Badge
              variant="outline"
              className="text-xs font-medium bg-background/50 backdrop-blur-sm">
              {quiz.category}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 rounded-full transition-all duration-200 ${
              isBookmarked
                ? "bg-primary/10 hover:bg-primary/20"
                : "hover:bg-muted"
            } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={toggleBookmark}
            title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
            disabled={isPending}>
            <Bookmark
              className={`h-4 w-4 transition-all duration-200 ${
                isBookmarked
                  ? "fill-primary text-primary scale-110"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            />
            <span className="sr-only">
              {isBookmarked ? "Remove bookmark" : "Add bookmark"}
            </span>
          </Button>
        </div>

        {/* Title and description */}
        <div className="space-y-2">
          <CardTitle className="text-lg leading-tight line-clamp-2 font-bold text-foreground group-hover:text-primary transition-colors">
            {quiz.title}
          </CardTitle>
          <CardDescription className="line-clamp-2 text-sm text-muted-foreground leading-relaxed">
            {quiz.description}
          </CardDescription>
        </div>

        {/* Rating display */}
        <div className="flex items-center gap-2 pt-1">
          <div className="flex items-center gap-1">
            {renderStars(quiz.avgRating || 0)}
          </div>
          <span className="text-sm font-medium text-foreground">
            {quiz.avgRating?.toFixed(1)}
          </span>
          <span className="text-xs text-muted-foreground">
            {quiz.ratings || 0} {quiz.ratings === 1 ? "rating" : "ratings"}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pb-4 pt-0 space-y-4 flex-grow">
        <Separator className="opacity-30" />

        {/* Quiz stats grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gradient-to-br from-muted/30 to-muted/50 border border-border/50 hover:from-muted/40 hover:to-muted/60 transition-all duration-200">
            <Clock className="h-4 w-4 text-primary" />
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">
                {quiz.timeLimit ? formatSecondsToMinutes(quiz.timeLimit) : "∞"}
              </p>
              <p className="text-xs text-muted-foreground">Time</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gradient-to-br from-muted/30 to-muted/50 border border-border/50 hover:from-muted/40 hover:to-muted/60 transition-all duration-200">
            <BookOpen className="h-4 w-4 text-primary" />
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">
                {quiz.questions}
              </p>
              <p className="text-xs text-muted-foreground">Questions</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gradient-to-br from-muted/30 to-muted/50 border border-border/50 hover:from-muted/40 hover:to-muted/60 transition-all duration-200">
            <Users className="h-4 w-4 text-primary" />
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">
                {quiz.attempts}
              </p>
              <p className="text-xs text-muted-foreground">Attempts</p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0 pb-4">
        <Button
          className={`w-full h-10 text-sm font-semibold transition-all duration-300 shadow-sm ${
            isHovered
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}>
          <Link
            href={`/quizzes/${quiz.id}`}
            className="flex items-center justify-center gap-2">
            <Play className="h-4 w-4" />
            Start Quiz
            <ArrowRight
              className={`h-4 w-4 transition-all duration-300 ${
                isHovered ? "translate-x-1" : ""
              }`}
            />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
