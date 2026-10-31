import { z } from "zod";

export const setBookmarkSchema = z.object({
  slug: z.string().min(1).max(120),
  saved: z.boolean(),
});

export type SetBookmarkInput = z.infer<typeof setBookmarkSchema>;
