import { z } from "zod";

export const NAME_MIN = 2;
export const NAME_MAX = 40;
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 128;
export const DELETE_CONFIRM_WORD = "delete";

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function isValidTimezone(value: string) {
  try {
    new Intl.DateTimeFormat("en", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

function optionalUsername(pattern: RegExp, message: string) {
  return z
    .string()
    .trim()
    .refine((value) => value === "" || pattern.test(value), message);
}

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(NAME_MIN, `Use at least ${NAME_MIN} characters.`)
    .max(NAME_MAX, `Use at most ${NAME_MAX} characters.`),
  website: z
    .string()
    .trim()
    .max(200, "That link is too long.")
    .refine(
      (value) => value === "" || isHttpUrl(value),
      "Enter the full link, starting with https://.",
    ),
  instagram: optionalUsername(
    /^[a-z\d._]{1,30}$/i,
    "Use just your Instagram username, without the @.",
  ),
  x: optionalUsername(
    /^[a-z\d_]{1,15}$/i,
    "Use just your X username, without the @.",
  ),
});

export const timezoneSchema = z.object({
  timezone: z
    .string()
    .trim()
    .min(1)
    .max(64)
    .refine(isValidTimezone, "That timezone isn't recognised."),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: z
      .string()
      .min(PASSWORD_MIN, `Use at least ${PASSWORD_MIN} characters.`)
      .max(PASSWORD_MAX, `Use at most ${PASSWORD_MAX} characters.`),
    revokeOtherSessions: z.boolean(),
  })
  .refine((value) => value.newPassword !== value.currentPassword, {
    path: ["newPassword"],
    message: "Choose a different password from your current one.",
  });

// The callback returns a plain boolean on purpose. Without the annotation
// TypeScript infers a type guard and the field's type becomes "delete".
export const deleteAccountSchema = z.object({
  confirmation: z
    .string()
    .trim()
    .toLowerCase()
    .refine((value): boolean => value === DELETE_CONFIRM_WORD),
});

// Actions receive what the browser sends, before zod trims or lowercases it
export type ProfileValues = z.input<typeof profileSchema>;
export type TimezoneInput = z.input<typeof timezoneSchema>;
export type ChangePasswordInput = z.input<typeof changePasswordSchema>;
export type DeleteAccountInput = z.input<typeof deleteAccountSchema>;
