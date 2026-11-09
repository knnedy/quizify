import { z } from "zod";
import { firstValue } from "./search-params";

export const profileTabs = ["overview", "quizzes", "history"] as const;
export type ProfileTab = (typeof profileTabs)[number];

// A bad tab falls back to the overview instead of failing the page
export const profileParamsSchema = z.object({
  tab: firstValue(z.enum(profileTabs).optional()).catch(undefined),
});

export const userIdSchema = z.coerce.number().int().positive();
