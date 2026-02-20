import { headers } from "next/headers";
import { auth } from "@/server/better-auth";
import { AppNavbar } from "@/app/_components/Layout/AppNavbar";

/**
 * This is the layout for the protected routes.
 * It is used to wrap the protected routes with the AppNavbar.
 * @param children - The children to be rendered.
 * @returns The layout for the protected routes.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar user={session?.user || undefined} />
      <main>{children}</main>
    </div>
  );
}
