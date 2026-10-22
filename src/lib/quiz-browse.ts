export const quizSorts = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most played" },
  { value: "top-rated", label: "Top rated" },
] as const;

export type QuizSort = (typeof quizSorts)[number]["value"];

export const defaultQuizSort: QuizSort = "newest";

export function isQuizSort(value: string | undefined): value is QuizSort {
  return quizSorts.some((sort) => sort.value === value);
}
