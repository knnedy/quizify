export type ActionResult<T extends object = object> =
  | ({ ok: true } & T)
  | { ok: false; error: string };
