import { auth } from ".";
import { headers } from "next/headers";
import { cache } from "react";

/**
 * This function is used to get the session.
 * It uses the getSession function to get the session.
 * @returns The session.
 */
export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));
