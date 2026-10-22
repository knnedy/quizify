"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Calendar, TrendingUp } from "lucide-react";
import EmptyState from "./empty-state";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { WeeklyProgress } from "@/lib/types";

type Props = {
  weeklyProgress: WeeklyProgress[];
};

export default function WeeklyProgressChart({ weeklyProgress }: Props) {
  // Extract the progress array
  const progressData = weeklyProgress || [];

  // Get today's date without time components (to avoid timezone issues)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate the start date (7 days ago)
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 6); // Go back 6 days to get 7 days total

  // Create an array of the last 7 days (with zero values as defaults)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const fullDateStr = `${year}-${month}-${day}`;

    return {
      day: dayName,
      fullDate: fullDateStr,
      quizzes: 0,
      score: 0,
      xp: 0,
    };
  });

  // Merge actual progress data with our placeholder data using exact string comparison
  const mergedProgress = last7Days.map((placeholder) => {
    // Find matching data from progressData or use placeholder
    const matchingData = progressData.find(
      (item) => item.fullDate === placeholder.fullDate
    );

    return matchingData || placeholder;
  });

  // Check for activity - early return if no activity
  const hasActivity = mergedProgress.some((day) => day.quizzes > 0);

  if (!hasActivity) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Calendar className="mr-2 h-5 w-5" />
            Weekly Progress
          </CardTitle>
          <CardDescription>
            Complete quizzes to see your weekly progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Calendar}
            message="Take some quizzes to see your weekly progress!"
          />
        </CardContent>
      </Card>
    );
  }

  const maxScore = Math.max(...mergedProgress.map((item) => item.score), 10);
  const maxXP = Math.max(...mergedProgress.map((item) => item.xp), 10);

  // Calculate padded maximums for more spacious charts
  const paddedMaxScore = Math.ceil((maxScore * 1.15) / 10) * 10; // 15% padding
  const paddedMaxXP = Math.ceil((maxXP * 1.15) / 100) * 100; // 15% padding

  // Calculate summary statistics for footer
  const totalQuizzes = mergedProgress.reduce(
    (sum, day) => sum + day.quizzes,
    0
  );
  const totalXP = mergedProgress.reduce((sum, day) => sum + day.xp, 0);

  // Calculate average score (only for days with quizzes)
  const daysWithQuizzes = mergedProgress.filter((day) => day.quizzes > 0);
  const averageScore =
    daysWithQuizzes.length > 0
      ? Math.round(
          daysWithQuizzes.reduce((sum, day) => sum + day.score, 0) /
            daysWithQuizzes.length
        )
      : 0;

  // Find best day
  const bestDay =
    daysWithQuizzes.length > 0
      ? [...daysWithQuizzes].sort((a, b) => b.score - a.score)[0]
      : null;

  const chartConfig = {
    score: {
      label: "Score %",
      color: "hsl(215, 100%, 50%)",
    },
    xp: {
      label: "XP Gained",
      color: "hsl(140, 100%, 40%)",
    },
    quizzes: {
      label: "Quizzes Completed",
      color: "hsl(350, 100%, 60%)",
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Calendar className="mr-2 h-5 w-5" />
          Weekly Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              accessibilityLayer
              data={mergedProgress}
              margin={{
                left: 12,
                right: 24,
              }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                yAxisId="score"
                orientation="left"
                stroke={chartConfig.score.color}
                domain={[0, paddedMaxScore]}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis
                yAxisId="xp"
                orientation="right"
                stroke={chartConfig.xp.color}
                domain={[0, paddedMaxXP]}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line
                yAxisId="score"
                name="Score %"
                dataKey="score"
                type="monotone"
                stroke={chartConfig.score.color}
                strokeWidth={2.5}
                dot={{
                  r: 4,
                  fill: chartConfig.score.color,
                  strokeWidth: 0,
                }}
                activeDot={{
                  r: 6,
                  fill: chartConfig.score.color,
                  strokeWidth: 0,
                }}
              />
              <Line
                yAxisId="xp"
                name="XP Gained"
                dataKey="xp"
                type="monotone"
                stroke={chartConfig.xp.color}
                strokeWidth={2.5}
                dot={{
                  r: 4,
                  fill: chartConfig.xp.color,
                  strokeWidth: 0,
                }}
                activeDot={{
                  r: 6,
                  fill: chartConfig.xp.color,
                  strokeWidth: 0,
                }}
              />
              <Line
                yAxisId="xp"
                name="Quizzes Completed"
                dataKey="quizzes"
                type="monotone"
                stroke={chartConfig.quizzes.color}
                strokeWidth={2.5}
                dot={{
                  r: 4,
                  fill: chartConfig.quizzes.color,
                  strokeWidth: 0,
                }}
                activeDot={{
                  r: 6,
                  fill: chartConfig.quizzes.color,
                  strokeWidth: 0,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Average Score (this week): {averageScore}%{" "}
          {averageScore >= 75 && <TrendingUp className="h-4 w-4" />}
        </div>
        <div className="flex items-center gap-2 leading-none text-muted-foreground">
          {totalQuizzes} quiz{totalQuizzes !== 1 ? "zes" : ""} completed this
          week ({totalXP} XP gained)
        </div>
        {bestDay && (
          <div className="text-muted-foreground">
            Best day: <span className="font-medium">{bestDay.day}</span> with{" "}
            {bestDay.score}% score on {bestDay.quizzes} quiz
            {bestDay.quizzes !== 1 ? "zes" : ""}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
