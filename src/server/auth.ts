import "server-only";
import { db } from "./db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "USER",
        input: false,
      },
      timezone: {
        type: "string",
        required: false,
        defaultValue: "UTC",
      },
    },
  },
  advanced: {
    database: {
      generateId: false,
    },
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
