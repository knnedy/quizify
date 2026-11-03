import { z } from "zod";
import { firstValue } from "./search-params";

export const dashboardViews = ["playing", "creating"] as const;

export const dashboardParamsSchema = z.object({
  view: firstValue(z.enum(dashboardViews).optional()).catch(undefined),
});
