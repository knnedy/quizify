import { z } from "zod";
import {
  APPLICATION_MAX_LENGTH,
  APPLICATION_MIN_LENGTH,
} from "@/lib/creator-rules";

export const applyCreatorSchema = z.object({
  motivation: z
    .string()
    .trim()
    .min(APPLICATION_MIN_LENGTH)
    .max(APPLICATION_MAX_LENGTH),
});

export type ApplyCreatorInput = z.infer<typeof applyCreatorSchema>;
