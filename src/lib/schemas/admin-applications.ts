import { z } from "zod";
import {
  REJECTION_REASON_MAX,
  REJECTION_REASON_MIN,
} from "@/lib/creator-rules";

const id = z.number().int().positive();

export const approveApplicationSchema = z.object({ applicationId: id });

export const rejectApplicationSchema = z.object({
  applicationId: id,
  reason: z.string().trim().min(REJECTION_REASON_MIN).max(REJECTION_REASON_MAX),
});

export type ApproveApplicationInput = z.input<typeof approveApplicationSchema>;
export type RejectApplicationInput = z.input<typeof rejectApplicationSchema>;
