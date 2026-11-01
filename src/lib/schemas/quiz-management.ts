import { z } from "zod";

export const manageQuizSchema = z.object({
  slug: z.string().min(1).max(120),
});

export type ManageQuizInput = z.infer<typeof manageQuizSchema>;
