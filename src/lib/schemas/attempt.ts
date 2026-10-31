import { z } from "zod";

const id = z.number().int().positive();

const MAX_OPTIONS = 6;
const MAX_QUESTIONS = 50;
const MAX_QUESTION_MS = 86_400_000;

function withinQuestionLimit(value: Record<string, unknown>) {
  return Object.keys(value).length <= MAX_QUESTIONS;
}

export const startAttemptSchema = z.object({
  slug: z.string().min(1).max(120),
});

export const saveAnswerSchema = z.object({
  attemptId: id,
  questionId: id,
  optionIds: z.array(id).max(MAX_OPTIONS),
});

export const submitAttemptSchema = z.object({
  attemptId: id,
  timeout: z.boolean(),
  answers: z
    .record(z.string(), z.array(id).max(MAX_OPTIONS))
    .refine(withinQuestionLimit),
  timings: z
    .record(z.string(), z.number().int().min(0).max(MAX_QUESTION_MS))
    .refine(withinQuestionLimit),
});

export type StartAttemptInput = z.infer<typeof startAttemptSchema>;
export type SaveAnswerInput = z.infer<typeof saveAnswerSchema>;
export type SubmitAttemptInput = z.infer<typeof submitAttemptSchema>;
