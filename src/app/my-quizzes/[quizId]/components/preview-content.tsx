"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
import { OwnerQuizDetail, QuizDifficulty } from "@/server/db/schema";
import Link from "next/link";
import { formatSecondsToMinutes } from "@/lib/format-time";

type Props = {
  quiz: OwnerQuizDetail;
};

export default function QuizPreviewContent({ quiz }: Props) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(
    new Array(quiz.questions.length).fill(-1),
  );
  const [showAnswers, setShowAnswers] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  const handleAnswerSelect = (choiceIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = choiceIndex;
    setSelectedAnswers(newAnswers);
  };

  const getDifficultyColor = (difficulty: QuizDifficulty) => {
    switch (difficulty) {
      case "BEGINNER":
        return "bg-green-100 text-green-700";
      case "INTERMEDIATE":
        return "bg-yellow-100 text-yellow-700";
      case "ADVANCED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 py-4 sm:py-6">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" className="h-10">
              <Link href={`/my-quizzes`} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to My Quizzes
              </Link>
            </Button>
            <Badge
              variant="outline"
              className="h-10 px-4 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview Mode
            </Badge>
          </div>

          {/* Quiz Info Card */}
          <Card className="bg-primary-foreground backdrop-blur-xl shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <Badge className={getDifficultyColor(quiz.difficulty)}>
                  {quiz.difficulty}
                </Badge>
                <Badge variant="secondary" className="gap-2">
                  <BookOpen className="w-4 h-4" />
                  {quiz.category}
                </Badge>
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-bold mb-2">
                {quiz.title}
              </CardTitle>
              <p className="text-muted-foreground">{quiz.description}</p>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 text-sm text-muted-foreground">
                {quiz.isTimeLimited ? (
                  <div className="flex items-center gap-2 bg-primary/5 px-3 py-1.5 rounded-lg">
                    <Clock className="w-4 h-4" />
                    {formatSecondsToMinutes(quiz.timeLimit ?? 0)}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-primary/5 px-3 py-1.5 rounded-lg">
                    <Clock className="w-4 h-4" />
                    No time limit
                  </div>
                )}

                <div className="flex items-center gap-2 bg-primary/5 px-3 py-1.5 rounded-lg">
                  <Users className="w-4 h-4" />
                  {quiz.questions.length} questions
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Card */}
          <Card className="bg-primary-foreground backdrop-blur-xl shadow-lg">
            <CardHeader className="border-b border-border/40">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {quiz.questions.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAnswers(!showAnswers)}>
                  {showAnswers ? "Hide Answers" : "Show Answers"}
                </Button>
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
                <h3 className="text-xl font-semibold mb-6">
                  {currentQuestion.title}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
                  {currentQuestion.choices.map((choice, index) => {
                    const isSelected =
                      selectedAnswers[currentQuestionIndex] === index;
                    const isCorrect = currentQuestion.correctAnswer === index;
                    const showResult = showAnswers && (isSelected || isCorrect);

                    return (
                      <Button
                        key={index}
                        variant="outline"
                        className={`h-auto min-h-[3rem] sm:min-h-[3.5rem] p-2 sm:p-4 justify-start gap-2 sm:gap-4 relative 
                          ${
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "hover:border-primary/30"
                          }
                        `}
                        onClick={() => handleAnswerSelect(index)}>
                        <div className="flex items-center gap-2 sm:gap-4 w-full">
                          <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center text-xs">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className="flex-grow text-left break-words whitespace-normal overflow-wrap-break-word">
                            {choice}
                          </span>
                          {showResult && (
                            <div className="absolute right-2 sm:right-4 flex-shrink-0">
                              {isCorrect ? (
                                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                              ) : (
                                isSelected && (
                                  <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                                )
                              )}
                            </div>
                          )}
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </motion.div>
            </CardContent>
            <CardFooter className="border-t border-border/40 mt-6">
              <div className="flex justify-between items-center w-full pt-4">
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentQuestionIndex((i) => Math.max(0, i - 1))
                  }
                  disabled={currentQuestionIndex === 0}>
                  Previous
                </Button>
                <div className="flex items-center gap-2">
                  {showAnswers && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">
                        Correct Answer:{" "}
                        {String.fromCharCode(
                          65 + currentQuestion.correctAnswer,
                        )}
                      </span>
                    </div>
                  )}
                </div>
                <Button
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
