import "server-only";
import type { db } from "./index";

export type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
