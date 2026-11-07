import { z } from "zod";
import {
  BAN_REASON_MAX,
  BAN_REASON_MIN,
  NOTE_MAX,
  NOTE_MIN,
  defaultDirection,
  defaultSort,
  userFilters,
  userSorts,
  type UserQuery,
} from "@/lib/admin-users";
import { firstValue } from "./search-params";

const id = z.number().int().positive();

// Every field falls back instead of failing, so a bad URL never errors the page
const rawQuery = z.object({
  q: firstValue(z.string().optional()).catch(undefined),
  filter: firstValue(z.enum(userFilters).optional()).catch(undefined),
  sort: firstValue(z.enum(userSorts).optional()).catch(undefined),
  dir: firstValue(z.enum(["asc", "desc"]).optional()).catch(undefined),
  page: firstValue(z.coerce.number().int().min(1).max(10_000).optional()).catch(
    undefined,
  ),
});

export const userQuerySchema = rawQuery.transform((value): UserQuery => {
  const sort = value.sort ?? defaultSort;

  return {
    q: value.q?.trim().slice(0, 80) ?? "",
    filter: value.filter ?? "all",
    sort,
    dir: value.dir ?? defaultDirection(sort),
    page: value.page ?? 1,
  };
});

export const banUserSchema = z.object({
  userId: id,
  reason: z.string().trim().min(BAN_REASON_MIN).max(BAN_REASON_MAX),
  days: z.union([z.literal(7), z.literal(30), z.null()]),
  hideQuizzes: z.boolean(),
});

export const userTargetSchema = z.object({ userId: id });

export const userNoteSchema = z.object({
  userId: id,
  body: z.string().trim().min(NOTE_MIN).max(NOTE_MAX),
});

export type BanUserInput = z.input<typeof banUserSchema>;
export type UserTargetInput = z.input<typeof userTargetSchema>;
export type UserNoteInput = z.input<typeof userNoteSchema>;
