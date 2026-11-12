import { z } from "zod";
import {
  SUSPENSION_MESSAGE_MAX,
  SUSPENSION_MESSAGE_MIN,
} from "@/lib/moderation";

const quizId = z.number().int().positive();

export const reportedQuizSchema = z.object({ quizId });

export const suspendReportedSchema = z.object({
  quizId,
  message: z
    .string()
    .trim()
    .min(SUSPENSION_MESSAGE_MIN)
    .max(SUSPENSION_MESSAGE_MAX),
});

export type ReportedQuizInput = z.input<typeof reportedQuizSchema>;
export type SuspendReportedInput = z.input<typeof suspendReportedSchema>;
