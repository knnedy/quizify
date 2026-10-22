"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ArrowUpDown, Filter, BookOpen } from "lucide-react";
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
import type { PublicQuizOverview } from "@/server/db/schema";
import { motion } from "motion/react";
import QuizCard from "./quiz-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  difficultyIcons,
  getDifficultyConfig,
} from "@/lib/quiz-difficulty-config";

export default function QuizzesContent({
  quizzes,
  topRatedQuizzes,
  bookmarkedQuizzes,
}: {
  quizzes: PublicQuizOverview[];
  topRatedQuizzes: PublicQuizOverview[];
  bookmarkedQuizzes: PublicQuizOverview[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date_desc");
  const [activeTab, setActiveTab] = useState("all");

  // Initialize state from URL params when component mounts
  useEffect(() => {
    const search = searchParams.get("search") || "";
    const difficulty = searchParams.get("difficulty") || "all";
    const sort = searchParams.get("sort") || "date_desc";
    const tab = searchParams.get("tab") || "all";

    setSearchTerm(search);
    setDifficultyFilter(difficulty);
    setSortBy(sort);
    setActiveTab(tab);
  }, [searchParams]);

  const updateUrlParams = useCallback(
    (
      newSearch: string,
      newDifficulty: string,
      newSort: string,
      newTab?: string,
    ) => {
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

      // Handle tab parameter
      const tabToSet = newTab !== undefined ? newTab : activeTab;
      if (tabToSet && tabToSet !== "all") {
        params.set("tab", tabToSet);
      } else {
        params.delete("tab");
      }

      // Create the new URL based on the current pathname
      const queryString = params.toString();
      const currentPath = window.location.pathname;
      router.push(queryString ? `${currentPath}?${queryString}` : currentPath, {
        scroll: false,
      });
    },
    [router, searchParams, activeTab],
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

  const handleTabChange = useCallback(
    (value: string) => {
      setActiveTab(value);
      updateUrlParams(searchTerm, difficultyFilter, sortBy, value);
    },
    [searchTerm, difficultyFilter, sortBy, updateUrlParams],
  );

  // Get the current quiz list based on active tab
  const getCurrentQuizList = useMemo(() => {
    switch (activeTab) {
      case "top-rated":
        return topRatedQuizzes;
      case "bookmarks":
        return bookmarkedQuizzes;
      default:
        return quizzes;
    }
  }, [activeTab, quizzes, topRatedQuizzes, bookmarkedQuizzes]);

  const filteredAndSortedQuizzes = useMemo(() => {
    return getCurrentQuizList
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
  }, [getCurrentQuizList, searchTerm, difficultyFilter, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 py-4">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold tracking-tight">
                  Explore Quizzes
                </h1>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/40 rounded-md text-xs">
                  <BookOpen className="h-3.5 w-3.5 text-primary/70" />
                  <span>{filteredAndSortedQuizzes.length}</span>
                </div>
              </div>

              <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className="w-full sm:w-auto">
                <TabsList className="grid grid-cols-3 w-full sm:w-auto">
                  <TabsTrigger value="all">All ({quizzes.length})</TabsTrigger>
                  <TabsTrigger value="top-rated">
                    Top Rated ({topRatedQuizzes.length})
                  </TabsTrigger>
                  <TabsTrigger value="bookmarks">
                    Bookmarks ({bookmarkedQuizzes.length})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

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
                    placeholder={`Search ${
                      activeTab === "all"
                        ? "quizzes"
                        : activeTab === "top-rated"
                          ? "top rated quizzes"
                          : "bookmarked quizzes"
                    }...`}
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
            key={activeTab} // Re-animate when tab changes
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
                  <div className="mx-auto w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center">
                    <Search className="h-8 w-8 text-muted-foreground/60" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">
                      No{" "}
                      {activeTab === "all"
                        ? "quizzes"
                        : activeTab === "top-rated"
                          ? "top rated quizzes"
                          : "bookmarked quizzes"}{" "}
                      found
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto text-sm">
                      {activeTab === "bookmarks"
                        ? "You haven't bookmarked any quizzes yet. Browse and bookmark quizzes to see them here."
                        : "Try adjusting your search terms or filters to find what you're looking for."}
                    </p>

                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-6"
                      onClick={() => {
                        setSearchTerm("");
                        setDifficultyFilter("all");
                        updateUrlParams("", "all", sortBy);
                      }}>
                      Clear filters
                    </Button>
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
