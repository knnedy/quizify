"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ArrowUpDown, Plus, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { OwnerQuizOverview } from "@/server/db/schema";
import { motion } from "motion/react";
import QuizCard from "./quiz-card";
import {
  difficultyIcons,
  getDifficultyConfig,
} from "@/lib/quiz-difficulty-config";

export default function MyQuizzesContent({
  quizzes,
}: {
  quizzes: OwnerQuizOverview[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date_desc");

  // Initialize state from URL params when component mounts
  useEffect(() => {
    const search = searchParams.get("search") || "";
    const difficulty = searchParams.get("difficulty") || "all";
    const sort = searchParams.get("sort") || "date_desc";

    setSearchTerm(search);
    setDifficultyFilter(difficulty);
    setSortBy(sort);
  }, [searchParams]);

  const updateUrlParams = useCallback(
    (newSearch: string, newDifficulty: string, newSort: string) => {
      const params = new URLSearchParams(searchParams);

      if (newSearch) {
        params.set("search", newSearch);
      } else {
        params.delete("search");
      }

      if (newDifficulty && newDifficulty !== "all") {
        params.set("difficulty", newDifficulty);
      } else {
        params.delete("difficulty");
      }

      if (newSort && newSort !== "date_desc") {
        params.set("sort", newSort);
      } else {
        params.delete("sort");
      }

      // Create the new URL based on the current pathname (not just ".")
      const queryString = params.toString();
      const currentPath = window.location.pathname;
      router.push(queryString ? `${currentPath}?${queryString}` : currentPath, {
        scroll: false,
      });
    },
    [router, searchParams],
  );

  const handleDifficultyChange = useCallback(
    (newDifficulty: string) => {
      setDifficultyFilter(newDifficulty);
      updateUrlParams(searchTerm, newDifficulty, sortBy);
    },
    [setDifficultyFilter, updateUrlParams, searchTerm, sortBy],
  );

  const handleSortChange = useCallback(
    (newSort: string) => {
      setSortBy(newSort);
      updateUrlParams(searchTerm, difficultyFilter, newSort);
    },
    [setSortBy, updateUrlParams, searchTerm, difficultyFilter],
  );

  const filteredAndSortedQuizzes = useMemo(() => {
    return quizzes
      .filter((quiz) => {
        const matchesSearch = quiz.title
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesDifficulty =
          difficultyFilter === "all" || quiz.difficulty === difficultyFilter;
        return matchesSearch && matchesDifficulty;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "date_desc":
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          case "date_asc":
            return (
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
          case "name_asc":
            return a.title.localeCompare(b.title);
          case "name_desc":
            return b.title.localeCompare(a.title);
          default:
            return 0;
        }
      });
  }, [quizzes, searchTerm, difficultyFilter, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 py-4">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col space-y-4">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-foreground">
                    My Quizzes
                  </h1>
                  <Badge
                    variant="outline"
                    className="ml-2 px-2 py-0 h-6 text-xs">
                    {quizzes.length} total
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {filteredAndSortedQuizzes.length} of {quizzes.length} quizzes{" "}
                  {searchTerm || difficultyFilter !== "all"
                    ? "matching filters"
                    : ""}
                </p>
              </div>
              <Button className="h-9 px-3 shadow-sm w-full sm:w-auto">
                <Link
                  href="/quizzes/create"
                  className="flex items-center gap-1.5 justify-center">
                  <Plus className="h-4 w-4" />
                  Create Quiz
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-background/80 shadow-sm border rounded-lg p-3">
              <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search your quizzes..."
                    className="pl-9 h-9 text-sm w-full"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      updateUrlParams(e.target.value, difficultyFilter, sortBy);
                    }}
                  />
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 px-3 text-sm flex-1 sm:flex-none">
                        <Filter className="mr-1.5 h-3.5 w-3.5" />
                        {difficultyFilter === "all" ? "All" : difficultyFilter}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        onClick={() => handleDifficultyChange("all")}>
                        {difficultyIcons.DEFAULT} All Levels
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDifficultyChange("BEGINNER")}>
                        {difficultyIcons.BEGINNER} Beginner
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDifficultyChange("INTERMEDIATE")}>
                        {difficultyIcons.INTERMEDIATE} Intermediate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDifficultyChange("ADVANCED")}>
                        {difficultyIcons.ADVANCED} Advanced
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 px-3 text-sm flex-1 sm:flex-none">
                        <ArrowUpDown className="mr-1.5 h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Sort: </span>
                        {sortBy
                          .replace("_", " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        onClick={() => handleSortChange("date_desc")}>
                        Newest first
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleSortChange("date_asc")}>
                        Oldest first
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleSortChange("name_asc")}>
                        Name (A-Z)
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleSortChange("name_desc")}>
                        Name (Z-A)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAndSortedQuizzes.map((quiz, index) => {
              const diffConfig = getDifficultyConfig(quiz.difficulty);
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
                  key={quiz.id}>
                  <QuizCard quiz={quiz} diffConfig={diffConfig} />
                </motion.div>
              );
            })}
          </motion.div>

          {filteredAndSortedQuizzes.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}>
              <Card className="p-8 border border-dashed bg-background/50">
                <div className="text-center space-y-4">
                  {searchTerm || difficultyFilter !== "all" ? (
                    <div className="mx-auto w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center">
                      <Search className="h-8 w-8 text-muted-foreground/60" />
                    </div>
                  ) : (
                    <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Plus className="h-8 w-8 text-primary/60" />
                    </div>
                  )}

                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">
                      {searchTerm || difficultyFilter !== "all"
                        ? "No matches found"
                        : "Create your first quiz"}
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto text-sm">
                      {searchTerm || difficultyFilter !== "all"
                        ? "Try adjusting your search terms or filters to find what you're looking for."
                        : "Get started by creating your first quiz. It's easy to set up and share with others."}
                    </p>

                    {!searchTerm && difficultyFilter === "all" ? (
                      <Button size="lg" className="mt-6">
                        <Link
                          href="/quizzes/create"
                          className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Create New Quiz
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-6"
                        onClick={() => {
                          setSearchTerm("");
                          setDifficultyFilter("all");
                          updateUrlParams("", "all", "");
                        }}>
                        Clear filters
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
