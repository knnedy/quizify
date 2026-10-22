"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  Clock,
  Users,
  ArrowLeft,
  Eye,
  BookOpen,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { formatSecondsToMinutes } from "@/lib/format-time";
import type {
  OwnerQuizDetail,
  QuizAttempt,
  QuizDifficulty,
} from "@/server/db/schema";

interface QuizReviewProps {
  quiz: OwnerQuizDetail;
  quizAttempt: QuizAttempt;
}

export default function QuizReview({ quiz, quizAttempt }: QuizReviewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const userAnswer = quizAttempt.answers[currentQuestionIndex];
  const correctAnswer = currentQuestion.correctAnswer;
  const isAnswered = userAnswer !== -1 && userAnswer !== undefined;
  const isCorrect = userAnswer === correctAnswer;

  const getDifficultyColor = (difficulty: QuizDifficulty) => {
    switch (difficulty) {
      case "BEGINNER":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "INTERMEDIATE":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "ADVANCED":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 py-4 sm:py-6">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild className="h-10 gap-2">
              <Link href={`/quizzes/${quiz.id}/results`}>
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
            </Button>
            <Badge variant="outline" className="h-10 gap-2 px-4">
              <Eye className="w-4 h-4" />
              Review Mode
            </Badge>
          </div>

          {/* Quiz Info Card */}
          <Card className="bg-background backdrop-blur-xl shadow-lg">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                <div className="flex items-center gap-4">
                  <Badge className={getDifficultyColor(quiz.difficulty)}>
                    {quiz.difficulty}
                  </Badge>
                  <Badge variant="secondary" className="gap-2">
                    <BookOpen className="w-4 h-4" />
                    {quiz.category}
                  </Badge>
                </div>
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-bold mb-2">
                {quiz.title}
              </CardTitle>
              <p className="text-muted-foreground text-sm sm:text-base">
                {quiz.description}
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4 text-xs sm:text-sm">
                <div className="flex items-center gap-2 bg-primary/5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-foreground">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                  {formatSecondsToMinutes(quiz.timeLimit ?? 0)} allotted
                </div>
                <div className="flex items-center gap-2 bg-primary/5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-foreground">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                  {formatSecondsToMinutes(quizAttempt.timeTaken)} taken
                </div>
                <div className="flex items-center gap-2 bg-primary/5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-foreground">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  {quiz.questions.length} questions
                </div>
                <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-green-700 dark:text-green-400">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  {quizAttempt.score}/{quiz.questions.length} (
                  {quizAttempt.percentage}%)
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Card */}
          <Card className="bg-background backdrop-blur-xl shadow-lg">
            <CardHeader className="border-b border-border/40">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {quiz.questions.length}
                </span>
                <Badge
                  variant={
                    isCorrect
                      ? "default"
                      : isAnswered
                        ? "destructive"
                        : "secondary"
                  }
                  className={`text-xs sm:text-sm ${
                    isCorrect
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : ""
                  }`}>
                  {isCorrect
                    ? "Correct"
                    : isAnswered
                      ? "Incorrect"
                      : "Not Answered"}
                </Badge>
              </div>
              <Progress value={progress} className="h-2" />
            </CardHeader>
            <CardContent className="pt-6">
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-6 text-foreground">
                  {currentQuestion.title}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
                  {currentQuestion.choices.map((choice, index) => {
                    const isUserAnswer = userAnswer === index;
                    const isCorrectAnswer = correctAnswer === index;

                    const buttonClass =
                      "h-auto min-h-[3rem] sm:min-h-[3.5rem] p-2 sm:p-4 justify-start gap-2 sm:gap-4 relative text-xs sm:text-sm text-foreground";
                    let bgClass = "";
                    let iconComponent = null;

                    if (isUserAnswer && isCorrectAnswer) {
                      bgClass =
                        "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400";
                      iconComponent = (
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 dark:text-green-400" />
                      );
                    } else if (isUserAnswer && !isCorrectAnswer) {
                      bgClass =
                        "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400";
                      iconComponent = (
                        <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 dark:text-red-400" />
                      );
                    } else if (!isUserAnswer && isCorrectAnswer) {
                      bgClass =
                        "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400";
                      iconComponent = (
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 dark:text-green-400" />
                      );
                    } else {
                      bgClass = "border-border hover:border-primary/30";
                    }

                    return (
                      <Button
                        key={index}
                        variant="outline"
                        className={`${buttonClass} ${bgClass}`}
                        disabled>
                        <div className="flex items-center gap-2 sm:gap-4 w-full">
                          <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center text-xs">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className="flex-grow text-left break-words whitespace-normal overflow-wrap-break-word">
                            {choice}
                          </span>
                          <div className="absolute right-2 sm:right-4 flex-shrink-0">
                            {iconComponent}
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </motion.div>
            </CardContent>
            <CardFooter className="border-t border-border/40 mt-6">
              <div className="flex flex-col sm:flex-row justify-between items-center w-full pt-4 gap-4">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() =>
                    setCurrentQuestionIndex((i) => Math.max(0, i - 1))
                  }
                  disabled={currentQuestionIndex === 0}>
                  Previous
                </Button>

                <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                  {!isAnswered ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg w-full sm:w-auto">
                      <HelpCircle className="w-4 h-4" />
                      <span className="text-xs sm:text-sm font-medium">
                        You did not answer this question
                      </span>
                    </div>
                  ) : !isCorrect ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg w-full sm:w-auto">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-xs sm:text-sm font-medium">
                        Your answer: {String.fromCharCode(65 + userAnswer)}
                      </span>
                    </div>
                  ) : null}

                  {(!isAnswered || !isCorrect) && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg w-full sm:w-auto">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs sm:text-sm font-medium">
                        Correct: {String.fromCharCode(65 + correctAnswer)}
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  className="w-full sm:w-auto"
                  onClick={() =>
                    setCurrentQuestionIndex((i) =>
                      Math.min(quiz.questions.length - 1, i + 1),
                    )
                  }
                  disabled={currentQuestionIndex === quiz.questions.length - 1}>
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
