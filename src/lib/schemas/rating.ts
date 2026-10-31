import { z } from "zod";

export const rateQuizSchema = z.object({
  slug: z.string().min(1).max(120),
  rating: z.number().int().min(1).max(5),
});

export type RateQuizInput = z.infer<typeof rateQuizSchema>;
