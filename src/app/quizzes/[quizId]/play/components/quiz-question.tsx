"use client";

import React, {
  useCallback,
  useEffect,
  useReducer,
  useTransition,
} from "react";
import { PublicQuizDetail } from "@/server/db/schema";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock, ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { submitQuizAttempt } from "@/server/actions/quiz/attempt";
import { toast } from "sonner";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { Session } from "@/server/auth";
import { tryCatch } from "@/lib/try-catch";

interface QuizState {
  currentQuestion: number;
  answers: (number | null)[];
  timeLeft: number;
  isCompleted: boolean;
  showTimeWarning: boolean;
  score?: number;
  totalQuestions?: number;
  questionsAnswered?: number;
  timeTaken?: number;
}

type QuizAction =
  | { type: "SELECT_ANSWER"; questionIndex: number; answer: number }
  | { type: "NEXT_QUESTION" }
  | { type: "PREVIOUS_QUESTION" }
  | { type: "TICK_TIMER" }
  | { type: "COMPLETE_QUIZ" }
  | { type: "SET_TIME_WARNING" };

const createQuizReducer =
  () =>
  (state: QuizState, action: QuizAction): QuizState => {
    switch (action.type) {
      case "SELECT_ANSWER":
        const newAnswers = [...state.answers];
        newAnswers[action.questionIndex] = action.answer;
        return { ...state, answers: newAnswers };
      case "NEXT_QUESTION":
        return {
          ...state,
          currentQuestion: Math.min(
            state.currentQuestion + 1,
            state.answers.length - 1,
          ),
        };
      case "PREVIOUS_QUESTION":
        return {
          ...state,
          currentQuestion: Math.max(state.currentQuestion - 1, 0),
        };
      case "TICK_TIMER":
        return {
          ...state,
          timeLeft: Math.max(0, state.timeLeft - 1),
        };
      case "COMPLETE_QUIZ":
        return {
          ...state,
          isCompleted: true,
        };
      case "SET_TIME_WARNING":
        return {
          ...state,
          showTimeWarning: true,
        };
      default:
        return state;
    }
  };

interface QuizQuestionProps {
  quiz: PublicQuizDetail;
  session: Session;
}

export default function QuizQuestion({ quiz, session }: QuizQuestionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const initialState: QuizState = {
    currentQuestion: 0,
    answers: new Array(quiz.questions.length).fill(null),
    timeLeft: quiz.timeLimit ?? 0,
    isCompleted: false,
    showTimeWarning: false,
  };

  const [state, dispatch] = useReducer(createQuizReducer(), initialState);

  const handleFinish = useCallback(() => {
    const validAnswers = state.answers.filter(
      (answer): answer is number => answer !== null,
    );

    startTransition(async () => {
      const { data: result, error: submitQuizError } = await tryCatch(
        submitQuizAttempt(
          quiz.id,
          validAnswers,
          state.timeLeft,
          session.user.id,
        ),
      );

      if (submitQuizError) {
        toast.error(submitQuizError.message);
        return;
      }

      if (result.success) {
        // Show success toast
        toast.success("Quiz submitted successfully!");

        // Mark quiz as completed
        dispatch({ type: "COMPLETE_QUIZ" });

        // Redirect to results page
        router.push(`/quizzes/${quiz.id}/results`);
      }
    });
  }, [quiz.id, state.answers, state.timeLeft, session.user.id, router]);

  useEffect(() => {
    if (state.timeLeft > 0 && !state.isCompleted) {
      const timer = setTimeout(() => dispatch({ type: "TICK_TIMER" }), 1000);
      if (state.timeLeft <= 30 && !state.showTimeWarning) {
        dispatch({ type: "SET_TIME_WARNING" });
      }
      return () => clearTimeout(timer);
    } else if (state.timeLeft === 0) {
      handleFinish();
    }
  }, [state.timeLeft, state.isCompleted, state.showTimeWarning, handleFinish]);

  const handleAnswerSelect = (answerIndex: number) => {
    dispatch({
      type: "SELECT_ANSWER",
      questionIndex: state.currentQuestion,
      answer: answerIndex,
    });
  };

  const handleNext = () => {
    if (state.currentQuestion < quiz.questions.length - 1) {
      dispatch({ type: "NEXT_QUESTION" });
    } else {
      handleFinish();
    }
  };

  const handlePrevious = () => {
    dispatch({ type: "PREVIOUS_QUESTION" });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // If the component is in loading state (redirect is happening)
  if (state.isCompleted) {
    return (
      <div className="min-h-[calc(100vh-150px)] flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-background/90">
        <div className="w-full max-w-3xl mx-auto p-4 text-center">
          <AiOutlineLoading3Quarters className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-medium">
            Processing your quiz results...
          </h2>
          <p className="text-muted-foreground mt-2">
            You&apos;ll be redirected shortly.
          </p>
        </div>
      </div>
    );
  }

  const question = quiz.questions[state.currentQuestion];
  const progress = ((state.currentQuestion + 1) / quiz.questions.length) * 100;
  const isTimeRunningLow = state.timeLeft <= 30;
  const currentAnswer = state.answers[state.currentQuestion];

  return (
    <div className="min-h-[calc(100vh-150px)] flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-background/90">
      <div className="w-full max-w-3xl mx-auto p-4">
        <Card className="shadow-lg">
          <CardHeader className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-semibold line-clamp-1">
                  {quiz.title}
                </CardTitle>
                <p className="text-muted-foreground text-sm mt-1">
                  Question {state.currentQuestion + 1} of{" "}
                  {quiz.questions.length}
                </p>
              </div>
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors w-fit",
                  isTimeRunningLow
                    ? "bg-red-500/10 animate-pulse"
                    : "bg-primary/10",
                )}>
                <Clock
                  className={cn(
                    "w-4 h-4",
                    isTimeRunningLow ? "text-red-500" : "text-primary",
                  )}
                />
                <span
                  className={cn(
                    "font-medium",
                    isTimeRunningLow ? "text-red-500" : "text-primary",
                  )}>
                  {formatTime(state.timeLeft)}
                </span>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-medium">{question.title}</h2>
              <div className="space-y-3">
                {question.choices.map((choice, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center space-x-3 rounded-lg border p-3 transition-colors cursor-pointer",
                      currentAnswer === index
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50",
                    )}
                    onClick={() => handleAnswerSelect(index)}>
                    <div className="flex items-center gap-2 sm:gap-4 w-full">
                      <span
                        className={cn(
                          "flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center text-xs",
                          currentAnswer === index
                            ? "border-primary"
                            : "border-muted-foreground",
                        )}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="flex-grow text-left break-words whitespace-normal overflow-wrap-break-word">
                        {choice}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex gap-3 border-t pt-6">
            <Button
              onClick={handlePrevious}
              disabled={state.currentQuestion === 0 || isPending}
              variant="outline"
              className="flex-1">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={currentAnswer === null || isPending}
              className={cn(
                "flex-1",
                isPending && "opacity-80 cursor-not-allowed",
              )}>
              {state.currentQuestion < quiz.questions.length - 1 ? (
                <>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  {isPending ? (
                    <span className="inline-flex items-center">
                      <AiOutlineLoading3Quarters className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    <>
                      Finish
                      <Flag className="ml-2 h-4 w-4" />
                    </>
                  )}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
