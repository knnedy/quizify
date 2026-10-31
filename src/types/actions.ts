export type ActionErrorCode = "EXPIRED" | "FINISHED";

export type ActionResult<T extends object = object> =
  | ({ ok: true } & T)
  | { ok: false; error: string; code?: ActionErrorCode };
