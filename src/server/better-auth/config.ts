import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { env } from "@/env";
import { db } from "@/server/db";

export const auth = betterAuth({

  baseURL: env.NEXT_PUBLIC_BASE_URL,

  trustedOrigins: [env.NEXT_PUBLIC_BASE_URL],

  secret: env.BETTER_AUTH_SECRET,

  database: prismaAdapter(db, {
    provider: "postgresql", // or "sqlite" or "mysql"
  }),

  emailAndPassword: {
    enabled: true,
  },

  user: {
    additionalFields: {
      phone: {
        type: "string",
        input: true,
      },
      countryCode: {
        type: "string",
        input: true,
      },
    }
  }
});

export type Session = typeof auth.$Infer.Session;
