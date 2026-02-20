import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { env } from "@/env";
import { db } from "@/server/db";

/**
 * This function is used to create an auth client.
 * It uses the createAuthClient function to create an auth client.
 * @param opts - The options for the auth client.
 * @returns The auth client.
 */
export const auth = betterAuth({
  appName: "Training Portal",

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
    },
  },
  plugins: [
    jwt({
      jwt: {
        issuer: env.BETTER_AUTH_URL,
      },
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
