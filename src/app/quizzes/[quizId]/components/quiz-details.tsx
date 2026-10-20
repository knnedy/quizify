"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Clock,
  Award,
  Brain,
  BarChart3,
  Trophy,
  ChevronRight,
  PlayCircle,
  Calendar,
  User,
  Info,
  Medal,
  Timer,
  Star,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { PublicQuiz, QuizAttempt, QuizDifficulty } from "@/server/db/schema";
import { Session } from "@/server/auth";
import { formatSecondsToMinutes } from "@/lib/format-time";

type LeaderboardEntry = QuizAttempt & {
  user: {
    name: string;
    image?: string | null;
  };
  rank: number;
};

type QuizDetailsProps = {
  quiz: PublicQuiz;
  userAttempts: QuizAttempt[];
  leaderboard: LeaderboardEntry[];
  session: Session | null;
};

export default function QuizDetailsPage({
  quiz,
  userAttempts,
  leaderboard,
  session,
}: QuizDetailsProps) {
  const router = useRouter();

  const handleStartQuiz = () => {
    router.push(`/quizzes/${quiz.id}/play`);
  };

  const handleGoBack = () => {
    router.push("/quizzes");
  };

  const getDifficultyColor = (difficulty: QuizDifficulty) => {
    switch (difficulty) {
      case "BEGINNER":
        return "bg-emerald-500 text-emerald-50";
      case "INTERMEDIATE":
        return "bg-amber-500 text-amber-50";
      case "ADVANCED":
        return "bg-rose-500 text-rose-50";
      default:
        return "bg-slate-500 text-slate-50";
    }
  };

  const getDifficultyStars = (difficulty: QuizDifficulty) => {
    switch (difficulty) {
      case "BEGINNER":
        return 1;
      case "INTERMEDIATE":
        return 2;
      case "ADVANCED":
        return 3;
      default:
        return 0;
    }
  };

  // Find the user's best attempt
  const bestAttempt =
    userAttempts.length > 0
      ? userAttempts.reduce(
          (best, current) =>
            current.percentage > best.percentage ||
            (current.percentage === best.percentage &&
              current.timeTaken < best.timeTaken)
              ? current
              : best,
          userAttempts[0],
        )
      : null;

  return (
    <div className="container mx-auto py-4 px-2 sm:py-8 sm:px-4 max-w-4xl">
      <div className="mb-4 block">
        <Button
          variant="outline"
          size="sm"
          onClick={handleGoBack}
          className="flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Quizzes
        </Button>
      </div>

      <Card className="mb-6 sm:mb-8">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge
                  className={cn(
                    "px-2 py-1 text-xs",
                    getDifficultyColor(quiz.difficulty),
                  )}>
                  {quiz.difficulty}
                </Badge>
                <Badge variant="outline" className="px-2 py-1 text-xs">
                  {quiz.category}
                </Badge>
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent break-words">
                {quiz.title}
              </CardTitle>
              <CardDescription className="mt-2 text-sm sm:text-base break-words">
                {quiz.description}
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 w-full sm:min-w-[140px] sm:w-auto">
              <Button
                onClick={handleStartQuiz}
                size="lg"
                className="w-full group bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-md">
                <PlayCircle className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                Play Quiz
                <ChevronRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                {userAttempts.length} previous attempts
              </p>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-6">
            {[
              {
                icon: (
                  <div className="flex">
                    {Array.from({
                      length: getDifficultyStars(quiz.difficulty),
                    }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-3 w-3 sm:h-4 sm:w-4 text-primary fill-primary"
                      />
                    ))}
                  </div>
                ),
                title: "Difficulty",
                value: quiz.difficulty,
              },
              {
                icon: <Timer className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />,
                title: "Time Limit",
                value:
                  quiz.isTimeLimited && quiz.timeLimit
                    ? formatSecondsToMinutes(quiz.timeLimit)
                    : "No limit",
              },
              {
                icon: <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />,
                title: "Questions",
                value: `${quiz.questions.length} total`,
              },
              {
                icon: (
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                ),
                title: "XP Reward",
                value: "Up to 150 XP",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center p-2 sm:p-4 bg-muted/50 rounded-xl transition-all duration-300 hover:bg-muted hover:shadow-md">
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 mb-2 sm:mb-3">
                  {item.icon}
                </div>
                <span className="text-xs sm:text-sm font-medium">
                  {item.title}
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          {bestAttempt && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-3 sm:p-5 mb-6 shadow-sm transition-all duration-300 hover:shadow-md">
              <h3 className="font-medium text-sm sm:text-base text-blue-800 dark:text-blue-300 mb-3 flex items-center">
                <Trophy className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-amber-500" />{" "}
                Your Best Performance
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                <div className="bg-white/80 dark:bg-slate-900/50 rounded-lg p-2 sm:p-3 shadow-sm">
                  <div className="flex items-center mb-1">
                    <Medal className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-primary" />
                    <p className="text-xs text-muted-foreground">Score</p>
                  </div>
                  <p className="text-base sm:text-lg font-semibold">
                    {bestAttempt.score}/{quiz.questions.length}
                  </p>
                  <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full"
                      style={{ width: `${bestAttempt.percentage}%` }}></div>
                  </div>
                  <p className="text-xs text-right mt-1 text-muted-foreground">
                    {bestAttempt.percentage}%
                  </p>
                </div>
                <div className="bg-white/80 dark:bg-slate-900/50 rounded-lg p-2 sm:p-3 shadow-sm">
                  <div className="flex items-center mb-1">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-primary" />
                    <p className="text-xs text-muted-foreground">Time Taken</p>
                  </div>
                  <p className="text-base sm:text-lg font-semibold">
                    {formatSecondsToMinutes(bestAttempt.timeTaken)}
                  </p>
                  <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full"
                      style={{
                        width: `${
                          quiz.isTimeLimited && quiz.timeLimit
                            ? Math.min(
                                100,
                                (bestAttempt.timeTaken / quiz.timeLimit) * 100,
                              )
                            : 100
                        }%`,
                      }}></div>
                  </div>
                  <p className="text-xs text-right mt-1 text-muted-foreground">
                    {quiz.isTimeLimited && quiz.timeLimit
                      ? `${Math.round(
                          (bestAttempt.timeTaken / quiz.timeLimit) * 100,
                        )}% of limit`
                      : "No limit"}
                  </p>
                </div>
                <div className="bg-white/80 dark:bg-slate-900/50 rounded-lg p-2 sm:p-3 shadow-sm">
                  <div className="flex items-center mb-1">
                    <Award className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-primary" />
                    <p className="text-xs text-muted-foreground">XP Earned</p>
                  </div>
                  <p className="text-base sm:text-lg font-semibold">
                    {bestAttempt.xpEarned} XP
                  </p>
                  <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (bestAttempt.xpEarned / 150) * 100,
                        )}%`,
                      }}></div>
                  </div>
                  <p className="text-xs text-right mt-1 text-muted-foreground">
                    {Math.round((bestAttempt.xpEarned / 150) * 100)}% of max
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4 w-full justify-start bg-muted/50 p-1 rounded-xl overflow-x-auto">
          <TabsTrigger
            value="overview"
            className="rounded-lg data-[state=active]:bg-background text-xs sm:text-sm">
            <Info className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="attempts"
            className="rounded-lg data-[state=active]:bg-background text-xs sm:text-sm">
            <User className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            My Attempts
          </TabsTrigger>
          <TabsTrigger
            value="leaderboard"
            className="rounded-lg data-[state=active]:bg-background text-xs sm:text-sm">
            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            Leaderboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Info className="h-5 w-5 mr-2 text-primary" />
                Quiz Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Category
                    </h3>
                    <div className="flex items-center">
                      <Badge variant="outline" className="mr-2">
                        {quiz.category}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Created By
                    </h3>
                    <p className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage
                          src={quiz.user.image ? quiz.user.image : undefined}
                          alt="user-profile"
                        />
                        <AvatarFallback>
                          {quiz.user.name.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      {quiz.user.name}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Created On
                    </h3>
                    <p className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      {format(quiz.createdAt, "MMMM d, yyyy")}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Scoring
                    </h3>
                    <div className="bg-muted/50 p-3 rounded-lg text-sm">
                      <ul className="list-disc list-inside space-y-1">
                        <li>Each correct answer is worth 1 point</li>
                        <li>Time bonus applied for fast completion</li>
                        <li>
                          Difficulty bonus:{" "}
                          {quiz.difficulty === "BEGINNER"
                            ? "0"
                            : quiz.difficulty === "INTERMEDIATE"
                              ? "25"
                              : "50"}{" "}
                          XP
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-6">
              <Button onClick={handleStartQuiz} className="w-full sm:w-auto">
                <PlayCircle className="mr-2 h-5 w-5" />
                Start Quiz Now
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="attempts" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <User className="h-5 w-5 mr-2 text-primary" />
                My Quiz Attempts
              </CardTitle>
              <CardDescription>
                Your history of attempts for this quiz
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userAttempts.length > 0 ? (
                <div className="rounded-xl border overflow-hidden">
                  <ScrollArea className="w-full" type="always">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Time Taken</TableHead>
                          <TableHead>XP Earned</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userAttempts.map((attempt, index) => (
                          <TableRow
                            key={attempt.id}
                            className={
                              index === 0
                                ? "bg-blue-50/50 dark:bg-blue-950/20"
                                : ""
                            }>
                            <TableCell>
                              <div className="font-medium">
                                {format(attempt.createdAt, "MMM d, yyyy")}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {format(attempt.createdAt, "h:mm a")}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <div className="mr-2 font-medium">
                                  {attempt.score}/{quiz.questions.length}
                                </div>
                                <Badge
                                  variant={
                                    attempt.percentage >= 70
                                      ? "default"
                                      : "outline"
                                  }
                                  className="text-xs">
                                  {attempt.percentage}%
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                                {formatSecondsToMinutes(attempt.timeTaken)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Award className="h-3 w-3 mr-1 text-amber-500" />
                                <span className="font-medium">
                                  {attempt.xpEarned}
                                </span>
                                <span className="text-xs text-muted-foreground ml-1">
                                  XP
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0">
                                <Info className="h-4 w-4" />
                                <span className="sr-only">View Details</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
              ) : (
                <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed">
                  <div className="flex justify-center mb-4">
                    <div className="rounded-full bg-muted/50 p-3">
                      <PlayCircle className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    You haven&apos;t attempted this quiz yet.
                  </p>
                  <Button
                    onClick={handleStartQuiz}
                    className="bg-gradient-to-r from-primary to-primary/80">
                    <PlayCircle className="mr-2 h-5 w-5" />
                    Take Quiz Now
                  </Button>
                </div>
              )}
            </CardContent>
            {userAttempts.length > 0 && (
              <CardFooter className="flex justify-center border-t pt-6">
                <Button
                  onClick={handleStartQuiz}
                  variant="outline"
                  className="w-full sm:w-auto">
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Try Again
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                Leaderboard
              </CardTitle>
              <CardDescription>Top performers on this quiz</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border overflow-hidden">
                <ScrollArea className="w-full" type="always">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>XP Earned</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaderboard.map((entry) => (
                        <TableRow
                          key={entry.id}
                          className={cn(
                            session?.user.name === entry.user.name
                              ? "bg-blue-50/50 dark:bg-blue-950/20"
                              : "",
                            entry.rank <= 3
                              ? "bg-amber-50/30 dark:bg-amber-950/10"
                              : "",
                          )}>
                          <TableCell>
                            {entry.rank <= 3 ? (
                              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-yellow-300 text-amber-900 font-bold shadow-sm">
                                {entry.rank}
                              </div>
                            ) : (
                              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-muted text-muted-foreground font-medium">
                                {entry.rank}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8 mr-2">
                                <AvatarImage
                                  src={entry.user.image || undefined}
                                  alt={entry.user.name}
                                />
                                <AvatarFallback>
                                  {entry.user.name.substring(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <span
                                className={cn(
                                  "font-medium",
                                  entry.rank === 1
                                    ? "text-amber-700 dark:text-amber-400"
                                    : "",
                                  session?.user.name === entry.user.name
                                    ? "text-primary"
                                    : "",
                                )}>
                                {entry.user.name}
                                {session?.user.name === entry.user.name &&
                                  " (You)"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <div className="mr-2 font-medium">
                                {entry.score}/{quiz.questions.length}
                              </div>
                              <Badge
                                variant={
                                  entry.percentage >= 90 ? "default" : "outline"
                                }
                                className="text-xs">
                                {entry.percentage}%
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                              {formatSecondsToMinutes(entry.timeTaken)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Award className="h-3 w-3 mr-1 text-amber-500" />
                              <span className="font-medium">
                                {entry.xpEarned}
                              </span>
                              <span className="text-xs text-muted-foreground ml-1">
                                XP
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-6">
              <Button onClick={handleStartQuiz} className="w-full sm:w-auto">
                <PlayCircle className="mr-2 h-5 w-5" />
                Beat the High Score
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
