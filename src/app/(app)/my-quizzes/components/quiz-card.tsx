"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Clock,
  ArrowRight,
  Users,
  Settings,
  MoreVertical,
  BookOpen,
  Star,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatSecondsToMinutes } from "@/lib/format-date";
import { OwnerQuizOverview } from "@/server/db/schema";

type QuizCardProps = {
  quiz: OwnerQuizOverview;
  diffConfig: {
    color: string;
    icon: string;
    bgColor: string;
  };
};

export default function QuizCard({ quiz, diffConfig }: QuizCardProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

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

  return (
    <Card
      className="group h-full flex flex-col transition-all duration-300 hover:shadow-md hover:border-primary/20 overflow-hidden"
      onMouseEnter={() => setHoveredCard(quiz.id.toString())}
      onMouseLeave={() => setHoveredCard(null)}>
      <CardHeader className="pb-3 space-y-2">
        <div className="flex justify-between items-start">
          <Badge
            variant="secondary"
            className={`${diffConfig.color} ${diffConfig.bgColor} px-2 py-0.5 text-xs font-medium`}>
            {diffConfig.icon} {quiz.difficulty}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 rounded-full">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem>
                <span className="text-sm">Go to Quiz</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <span className="text-sm">Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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

      <CardContent className="pb-3 pt-0 space-y-4 flex-grow">
        <Separator className="opacity-50" />
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
                {quiz.attempts || 0}
              </p>
              <p className="text-xs text-muted-foreground">Attempts</p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0 gap-2 grid grid-cols-2">
        <Button variant="outline" size="sm" className="w-full h-9 text-sm">
          <Link href={`/my-quizzes/${quiz.id}/edit`}>
            <Settings className="mr-1.5 h-3.5 w-3.5" />
            Edit
          </Link>
        </Button>
        <Button
          className="w-full h-9 text-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
          variant={
            hoveredCard === quiz.id.toString() ? "default" : "secondary"
          }>
          <Link
            href={`/my-quizzes/${quiz.id}`}
            className="flex items-center justify-center">
            Preview
            <ArrowRight
              className={`ml-1.5 h-3.5 w-3.5 transition-all duration-300 ${
                hoveredCard === quiz.id.toString() ? "translate-x-1" : ""
              }`}
            />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
