import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { auth } from "@/server/better-auth";

/**
 * This function is used to create an auth client.
 * It uses the createAuthClient function to create an auth client.
 * @param opts - The options for the auth client.
 * @returns The auth client.
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  plugins: [
    inferAdditionalFields<typeof auth>(), // ← this infers your additionalFields
  ],
});

export type Session = typeof authClient.$Infer.Session;
