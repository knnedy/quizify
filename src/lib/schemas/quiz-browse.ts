import { z } from "zod";
import { difficulties } from "@/lib/difficulty";
import { defaultQuizSort, isQuizSort } from "@/lib/quiz-browse";

// Next gives repeated params as arrays, so take the first value
function firstValue<T extends z.ZodType>(schema: T) {
  return z.preprocess(
    (value) => (Array.isArray(value) ? value[0] : value),
    schema,
  );
}

// Every field falls back instead of failing, so a bad URL never errors the page
export const quizBrowseParamsSchema = z.object({
  q: firstValue(
    z
      .string()
      .transform((value) => value.trim().slice(0, 80) || undefined)
      .optional(),
  ).catch(undefined),
  category: firstValue(
    z
      .string()
      .regex(/^[a-z0-9-]{1,40}$/)
      .optional(),
  ).catch(undefined),
  difficulty: firstValue(z.enum(difficulties).optional()).catch(undefined),
  sort: firstValue(
    z
      .string()
      .transform((value) => (isQuizSort(value) ? value : defaultQuizSort)),
  ).catch(defaultQuizSort),
  page: firstValue(z.coerce.number().int().min(1).max(10_000)).catch(1),
});
