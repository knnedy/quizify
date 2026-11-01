import { z } from "zod";

// The first message for each field, for showing under the inputs
export function fieldErrors<K extends string>(
  error: z.ZodError,
): Partial<Record<K, string>> {
  const flat = z.flattenError(error).fieldErrors as Record<
    string,
    string[] | undefined
  >;

  const result: Partial<Record<K, string>> = {};
  for (const [field, messages] of Object.entries(flat)) {
    const message = messages?.[0];
    if (message) result[field as K] = message;
  }
  return result;
}
