"use client";

import { Activity, TrendingUp } from "lucide-react";
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
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import EmptyState from "./empty-state";

type CategoryPerformance = { name: string; score: number; quizzes: number };

type Props = {
  categoryPerformance: CategoryPerformance[];
};

export default function CategoryPerformanceChart({
  categoryPerformance,
}: Props) {
  if (categoryPerformance.length === 0) {
    return (
      <Card>
        <CardHeader className="items-center">
          <CardTitle>Category Performance</CardTitle>
          <CardDescription>
            Complete quizzes to see your performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={TrendingUp}
            message="Take quizzes in different categories to see your performance!"
          />
        </CardContent>
      </Card>
    );
  }

  // Calculate average score across categories
  const totalScore = categoryPerformance.reduce(
    (sum, item) => sum + item.score,
    0
  );
  const averageScore = Math.round(totalScore / categoryPerformance.length);

  // Calculate total quizzes
  const totalQuizzes = categoryPerformance.reduce(
    (sum, item) => sum + item.quizzes,
    0
  );

  // Find best performing category
  const bestCategory = [...categoryPerformance].sort(
    (a, b) => b.score - a.score
  )[0];

  const chartConfig = {
    score: {
      label: "Score %",
      color: "hsl(var(--chart-1))",
    },
    quizzes: {
      label: "No. of quizzes",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-bold">
          <Activity className="mr-2 h-5 w-5 text-primary" />
          Category Performance
        </CardTitle>
        <CardDescription>Your quiz scores by category</CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={categoryPerformance}>
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <PolarGrid
                className="fill-[--color-score] opacity-20"
                gridType="circle"
              />
              <PolarAngleAxis
                dataKey="name"
                tick={{ fill: "#888888", fontSize: 12 }}
              />
              <Radar
                name="Score %"
                dataKey="score"
                fill="var(--color-score)"
                fillOpacity={0.5}
              />
              {/* Hidden Radar just for tooltip data */}
              <Radar
                name="No. of quizzes"
                dataKey="quizzes"
                fill="var(--color-quizzes)"
                fillOpacity={0}
                stroke="transparent"
              />
            </RadarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Average Score: {averageScore}%{" "}
          {averageScore >= 75 && <TrendingUp className="h-4 w-4" />}
        </div>
        <div className="flex items-center gap-2 leading-none text-muted-foreground">
          {totalQuizzes} quiz{totalQuizzes !== 1 ? "zes" : ""} across{" "}
          {categoryPerformance.length} categor
          {categoryPerformance.length !== 1 ? "ies" : "y"}
        </div>
        {bestCategory && (
          <div className="text-muted-foreground">
            Best performance:{" "}
            <span className="font-medium">{bestCategory.name}</span> (
            {bestCategory.score}%)
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
