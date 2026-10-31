import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { users } from "./db/schema";

function banMessage(reason: string | null, expires: Date | null) {
  const until = expires
    ? ` until ${new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeZone: "UTC",
      }).format(expires)}`
    : "";
  const why = reason ? ` Reason: ${reason}` : "";
  return `This account is banned${until}.${why}`;
}

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
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const userId = Number(session.userId);

          const [user] = await db
            .select({
              banned: users.banned,
              banReason: users.banReason,
              banExpires: users.banExpires,
            })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

          if (!user?.banned) return;

          if (user.banExpires && user.banExpires <= new Date()) {
            await db
              .update(users)
              .set({ banned: false, banReason: null, banExpires: null })
              .where(eq(users.id, userId));
            return;
          }

          throw new APIError("FORBIDDEN", {
            message: banMessage(user.banReason, user.banExpires),
          });
        },
      },
    },
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
