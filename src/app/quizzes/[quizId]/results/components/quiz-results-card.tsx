"use client";

import type React from "react";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import type { OwnerQuizDetail, QuizAttempt } from "@/server/db/schema";
import { cn } from "@/lib/utils";
import {
  Award,
  Clock,
  FileText,
  Flame,
  Compass,
  Zap,
  Medal,
  Rocket,
  Target,
  Timer,
  Trophy,
  Heart,
  MessageSquare,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { StarRating } from "./star-rating";
import { toast } from "sonner";
import { tryCatch } from "@/lib/try-catch";
import { submitQuizRating } from "@/server/actions/quiz/rating";

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: string;
  tooltip?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  value,
  label,
  color,
  tooltip,
}) => (
  <div
    className="flex items-center gap-2 sm:gap-4 p-2 sm:p-4 border rounded-lg hover:shadow-sm transition-shadow"
    title={tooltip}>
    <div className={cn("p-2 sm:p-3 rounded-full")}>{icon}</div>
    <div>
      <span className={cn("text-base sm:text-xl font-bold", color)}>
        {value}
      </span>
      <div className="text-xs sm:text-sm font-medium text-muted-foreground">
        {label}
      </div>
    </div>
  </div>
);

interface QuizResultsProps {
  quiz: OwnerQuizDetail;
  quizAttempt: QuizAttempt;
  userId: string;
}

export default function QuizResultsCard({
  quiz,
  quizAttempt,
  userId,
}: QuizResultsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [userRating, setUserRating] = useState<number>(0);
  const [hasRated, setHasRated] = useState(false);

  const percentage = quizAttempt.percentage;
  const score = quizAttempt.score;
  const totalQuestions = quiz.questions.length;
  const xpEarned = quizAttempt.xpEarned;

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const avgTimePerQuestion = Math.round(quizAttempt.timeTaken / totalQuestions);
  const xpPerQuestion = (xpEarned / quizAttempt.answers.length).toFixed(1);

  const getPerformanceData = (): {
    message: string;
    icon: React.ReactNode;
    color: string;
    gradient: string;
  } => {
    if (percentage >= 90)
      return {
        message: "Excellent!",
        icon: <Trophy className="w-6 sm:w-8 h-6 sm:h-8 text-amber-600" />,
        color: "text-amber-600",
        gradient: "from-amber-500/20 to-amber-300/5",
      };
    if (percentage >= 75)
      return {
        message: "Great Job!",
        icon: <Award className="w-6 sm:w-8 h-6 sm:h-8 text-indigo-600" />,
        color: "text-indigo-600",
        gradient: "from-indigo-500/20 to-indigo-300/5",
      };
    if (percentage >= 60)
      return {
        message: "Good Effort!",
        icon: <Medal className="w-6 sm:w-8 h-6 sm:h-8 text-emerald-600" />,
        color: "text-emerald-600",
        gradient: "from-emerald-500/20 to-emerald-300/5",
      };
    return {
      message: "Keep Practicing!",
      icon: <Target className="w-6 sm:w-8 h-6 sm:h-8 text-blue-600" />,
      color: "text-blue-600",
      gradient: "from-blue-500/20 to-blue-300/5",
    };
  };

  const performanceData = getPerformanceData();

  const handleRatingSubmit = async (rating: number) => {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        submitQuizRating(quiz.id, rating, userId),
      );

      if (error) {
        toast.error("Failed to submit rating");
        return;
      }

      if (result.success) {
        toast.success("Rating submitted successfully");
        setUserRating(rating);
        setHasRated(true);
      }
    });
  };

  return (
    <Card
      className={cn(
        "max-w-xl w-full mx-auto shadow-lg",
        "bg-gradient-to-br from-background via-background to-background",
        "border-t-4",
        percentage >= 90
          ? "border-t-amber-500"
          : percentage >= 75
            ? "border-t-indigo-500"
            : percentage >= 60
              ? "border-t-emerald-500"
              : "border-t-blue-500",
      )}>
      <div
        className={cn(
          "absolute inset-0 opacity-10 bg-gradient-to-br pointer-events-none",
          performanceData.gradient,
        )}
      />

      <div className="flex flex-col sm:flex-row p-4 sm:p-6 gap-4 sm:gap-6 items-center relative z-10">
        {/* Score Circle */}
        <div className="relative w-24 sm:w-32 h-24 sm:h-32 flex-shrink-0">
          <svg
            className="w-full h-full transform -rotate-90"
            viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              className="text-muted/10"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              strokeDasharray={`${percentage * 2.83} 1000`}
              className={cn(
                percentage >= 90
                  ? "text-amber-500"
                  : percentage >= 75
                    ? "text-indigo-500"
                    : percentage >= 60
                      ? "text-emerald-500"
                      : "text-blue-500",
              )}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <span
                className={cn(
                  "text-xl sm:text-2xl font-bold",
                  performanceData.color,
                )}>
                {percentage}%
              </span>
              <p className="text-xs font-medium text-muted-foreground">Score</p>
            </div>
          </div>
        </div>

        {/* Header Text */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
            {performanceData.icon}
            <CardTitle
              className={cn(
                "text-xl sm:text-2xl font-bold",
                performanceData.color,
              )}>
              {performanceData.message}
            </CardTitle>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground mb-3 text-center sm:text-left">
            You scored {score} out of {totalQuestions} questions
          </p>

          <div
            className={cn(
              "flex items-center justify-center gap-2 text-xs sm:text-sm p-2 rounded-lg",
              percentage >= 90
                ? "bg-amber-50 text-amber-600"
                : percentage >= 75
                  ? "bg-indigo-50 text-indigo-600"
                  : percentage >= 60
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-blue-50 text-blue-600",
            )}>
            <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>
              You earned <strong>{xpEarned} XP</strong> from this quiz!
            </span>
          </div>
        </div>
      </div>

      <CardContent className="pt-0 pb-4">
        {/* Primary Stats */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3">
          <StatCard
            icon={<Target className="w-4 h-4 sm:w-5 sm:h-5" />}
            value={`${score}/${totalQuestions}`}
            label="Correct Answers"
            color={performanceData.color}
            tooltip="Number of questions answered correctly"
          />

          <StatCard
            icon={<Zap className="w-4 h-4 sm:w-5 sm:h-5" />}
            value={`${xpEarned}`}
            label="XP Earned"
            color="text-purple-600"
            tooltip="Experience points earned from this quiz"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
          <StatCard
            icon={<Clock className="w-4 h-4 sm:w-5 sm:h-5" />}
            value={formatTime(quizAttempt.timeTaken)}
            label="Time Taken"
            color="text-emerald-600"
            tooltip="Total time spent on the quiz"
          />

          <StatCard
            icon={<Timer className="w-4 h-4 sm:w-5 sm:h-5" />}
            value={`${avgTimePerQuestion}s`}
            label="Per Question"
            color="text-indigo-600"
            tooltip="Average time spent per question"
          />

          <StatCard
            icon={<Flame className="w-4 h-4 sm:w-5 sm:h-5" />}
            value={`${xpPerQuestion}`}
            label="XP/Question"
            color="text-amber-600"
            tooltip="Average XP earned per question"
          />
        </div>

        {/* Rating Section */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Heart className="w-5 h-5 text-pink-500" />
            <h3 className="text-lg font-semibold text-center">
              Rate this Quiz
            </h3>
          </div>

          {!hasRated ? (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">
                How would you rate your experience with this quiz?
              </p>
              <div className="flex justify-center mb-3">
                <StarRating
                  initialRating={userRating}
                  onRatingChange={setUserRating}
                  disabled={isPending}
                  size="lg"
                />
              </div>
              {userRating > 0 && (
                <Button
                  onClick={() => handleRatingSubmit(userRating)}
                  disabled={isPending}
                  size="sm"
                  className="bg-pink-500 hover:bg-pink-600 text-white">
                  {isPending ? "Submitting..." : "Submit Rating"}
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Thank you for your feedback!
                </span>
              </div>
              <div className="flex justify-center">
                <StarRating
                  initialRating={userRating}
                  onRatingChange={() => {}}
                  disabled={true}
                  size="md"
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row gap-3 pt-2 pb-6">
        <Button
          onClick={() => router.push("/explore")}
          className="w-full sm:flex-1 bg-background text-foreground border border-input mb-2 sm:mb-0"
          variant="outline">
          <Compass className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          Explore Quizzes
        </Button>

        <Button
          onClick={() => router.push(`/quizzes/${quiz.id}/review`)}
          className="w-full sm:flex-1 bg-background text-foreground border border-input mb-2 sm:mb-0"
          variant="outline">
          <FileText className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          Review
        </Button>

        <Button
          onClick={() => router.push(`/quizzes/${quiz.id}`)}
          className={cn(
            "w-full sm:flex-1",
            percentage >= 90
              ? "bg-amber-500 hover:bg-amber-600"
              : percentage >= 75
                ? "bg-indigo-500 hover:bg-indigo-600"
                : percentage >= 60
                  ? "bg-emerald-500 hover:bg-emerald-600"
                  : "bg-blue-500 hover:bg-blue-600",
          )}>
          <Rocket className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          Retry Quiz
        </Button>
      </CardFooter>
    </Card>
  );
}
