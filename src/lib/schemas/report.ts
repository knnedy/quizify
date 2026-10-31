import { z } from "zod";
import { reportDetailsMax, reportReasons } from "@/lib/report-reasons";

export const reportQuizSchema = z.object({
  slug: z.string().min(1).max(120),
  reason: z.enum(reportReasons),
  details: z.string().trim().max(reportDetailsMax).optional(),
});

export type ReportQuizInput = z.infer<typeof reportQuizSchema>;
