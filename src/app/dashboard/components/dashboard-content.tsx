"use client";

import React, { useState } from "react";
import {
  PlusCircle,
  PlayCircle,
  TrendingUp,
  Medal,
  Book,
  Trophy,
  Clock,
  Flame,
  Zap,
  Brain,
  Bookmark,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Session } from "@/server/auth";
import {
  CategoryPerformance,
  UserRecentAttempt,
  UserStats,
  WeeklyProgress,
} from "@/lib/types";
import WeeklyProgressChart from "./weekly-progress";
import CategoryPerformanceChart from "./category-performance";
import EmptyState from "./empty-state";
import StatCard from "./stat-card";
import QuizCard from "./quiz-card";
import ActionButton from "./action-button";
import { formatSecondsToMinutes } from "@/lib/format-time";

// const AchievementCard = ({ achievement }: { achievement: Achievement }) => (
//   <div className="p-4 border rounded-lg bg-card hover:bg-accent transition-colors">
//     <h3 className="font-medium mb-1">{achievement.title}</h3>
//     <p className="text-sm text-muted-foreground mb-2">
//       {achievement.description}
//     </p>
//     <Progress value={achievement.progress} className="h-2" />
//     <p className="text-xs text-muted-foreground mt-1">
//       {achievement.progress}% Complete
//     </p>
//   </div>
// );

type Props = {
  session: Session;
  stats: UserStats;
  recentQuizzes: UserRecentAttempt[];
  categoryPerformance: CategoryPerformance[];
  weeklyProgress: WeeklyProgress[];
};

export default function DashboardContent({
  session,
  stats,
  recentQuizzes,
  categoryPerformance,
  weeklyProgress,
}: Props) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl font-semibold text-foreground mb-2">
            Welcome, {session.user.name}
          </h1>
          <p className="text-muted-foreground">
            Ready to test your knowledge and grow your skills?
          </p>
        </div>

        <div className="mb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              <div className="grid md:grid-cols-4 gap-6">
                <StatCard
                  title="Quizzes Taken"
                  value={stats.totalQuizzesTaken}
                  icon={PlayCircle}
                  subtitle="Total quizzes completed"
                />
                <StatCard
                  title="Average Score"
                  value={stats.averageScore ? `${stats.averageScore}%` : "-"}
                  icon={TrendingUp}
                  progress={stats.averageScore}
                />
                <StatCard
                  title="Current Streak"
                  value={
                    stats.currentStreak ? `${stats.currentStreak} days` : "-"
                  }
                  icon={Flame}
                  subtitle="Consecutive days of activity"
                />
                <StatCard
                  title="Total XP"
                  value={stats.totalXP ? stats.totalXP.toLocaleString() : "-"}
                  icon={Zap}
                  subtitle="Experience Points"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <PlayCircle className="mr-2 h-5 w-5" />
                      Recent Quizzes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recentQuizzes.length > 0 ? (
                      <div className="space-y-4">
                        {recentQuizzes.map((quiz) => (
                          <QuizCard key={quiz.id} quiz={quiz} />
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        icon={PlayCircle}
                        message="No quizzes taken yet. Start your learning journey!"
                      />
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <Zap className="mr-2 h-5 w-5" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ActionButton href="/quizzes" icon={PlayCircle}>
                      Start a Quiz
                    </ActionButton>
                    <ActionButton href="/quizzes/create" icon={PlusCircle}>
                      Create New Quiz
                    </ActionButton>
                    <ActionButton href="/my-quizzes" icon={Book}>
                      My Quizzes
                    </ActionButton>
                    <ActionButton
                      href="/quizzes/?tab=bookmarks"
                      icon={Bookmark}>
                      Bookmarks
                    </ActionButton>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="progress" className="grid md:grid-cols-2 gap-5">
              <WeeklyProgressChart weeklyProgress={weeklyProgress} />
              <CategoryPerformanceChart
                categoryPerformance={categoryPerformance}
              />
            </TabsContent>

            <TabsContent value="achievements" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="mr-2 h-5 w-5" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                {/* <CardContent>
                  {achievements.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      {achievements.map((achievement) => (
                        <AchievementCard
                          key={achievement.id}
                          achievement={achievement}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Trophy}
                      message="Start completing quizzes to earn achievements!"
                    />
                  )}
                </CardContent> */}
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="mr-2 h-5 w-5" />
                    Learning Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-4">
                  <StatCard
                    title="Avg. Time per Quiz"
                    value={
                      stats.averageTimePerQuiz
                        ? `${formatSecondsToMinutes(stats.averageTimePerQuiz)}`
                        : "-"
                    }
                    icon={Clock}
                    subtitle="Time management score"
                  />
                  <StatCard
                    title="Top Category"
                    value={stats.topCategory || "-"}
                    icon={Medal}
                    subtitle="Your strongest subject"
                  />
                  <StatCard
                    title="Best Streak"
                    value={stats.bestStreak ? `${stats.bestStreak} days` : "-"}
                    icon={Zap}
                    subtitle="Longest learning streak"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
