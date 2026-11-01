import { z } from "zod";
import { difficulties } from "@/lib/difficulty";
import { limits, questionTypes } from "@/lib/quiz-editor-rules";

const visibilities = ["PUBLIC", "UNLISTED", "PRIVATE"] as const;

const id = z.number().int().positive();
const key = z.string().min(1).max(64);

const optionSchema = z.object({
  id: id.optional(),
  key,
  label: z.string().trim().max(limits.optionMax),
  isCorrect: z.boolean(),
});

const questionSchema = z
  .object({
    id: id.optional(),
    key,
    type: z.enum(questionTypes),
    title: z.string().trim().max(limits.questionMax),
    explanation: z.string().trim().max(limits.explanationMax),
    options: z
      .array(optionSchema)
      .min(limits.optionsMin)
      .max(limits.optionsMax),
  })
  .refine(
    (question) =>
      question.type !== "TRUE_FALSE" || question.options.length === 2,
    "True or false questions have exactly two answers.",
  )
  .refine(
    (question) =>
      question.type === "MULTIPLE" ||
      question.options.filter((option) => option.isCorrect).length <= 1,
    "Only multiple answer questions can have several correct answers.",
  );

// What a draft needs at minimum. Whether the quiz is complete enough to
// publish is checked separately, with the same rules the editor uses.
const settingsSchema = z.object({
  title: z.string().trim().min(limits.titleMin).max(limits.titleMax),
  description: z.string().trim().max(limits.descriptionMax),
  category: z.string().min(1).max(40),
  difficulty: z.enum(difficulties),
  visibility: z.enum(visibilities),
  timeLimitMinutes: z
    .number()
    .int()
    .min(limits.minutesMin)
    .max(limits.minutesMax)
    .nullable(),
  shuffleQuestions: z.boolean(),
  shuffleOptions: z.boolean(),
  maxAttempts: z.number().int().min(1).max(100).nullable(),
  tags: z
    .array(z.string().trim().min(1).max(limits.tagMax))
    .max(limits.tagsMax),
});

export const saveQuizSchema = z
  .object({
    slug: z.string().min(1).max(120).optional(),
    settings: settingsSchema,
    questions: z.array(questionSchema).max(limits.questionsMax),
  })
  .refine(({ questions }) => {
    const questionKeys = questions.map((question) => question.key);
    const optionKeys = questions.flatMap((question) =>
      question.options.map((option) => option.key),
    );

    return (
      new Set(questionKeys).size === questionKeys.length &&
      new Set(optionKeys).size === optionKeys.length
    );
  }, "Keys must be unique.");

export type SaveQuizInput = z.infer<typeof saveQuizSchema>;
