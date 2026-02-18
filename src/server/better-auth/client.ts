import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { auth } from "@/server/better-auth";


export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL,
    plugins: [
        inferAdditionalFields<typeof auth>(), // ← this infers your additionalFields
      ],
});

export type Session = typeof authClient.$Infer.Session;
