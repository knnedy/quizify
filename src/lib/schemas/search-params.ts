import { z } from "zod";

// Next gives repeated params as arrays, so take the first value
export function firstValue<T extends z.ZodType>(schema: T) {
  return z.preprocess(
    (value) => (Array.isArray(value) ? value[0] : value),
    schema,
  );
}
