import { Suspense } from "react";
import { LoginForm } from "@/app/_components/forms/login";
import { LoginSkeleton } from "@/app/_components/skeletons/LoginSkeleton";
import { PublicNavbar } from "@/app/_components/Layout/PublicNavbar";

/**
 * Server Component: Home
 * Removed unnecessary Suspense boundary since LoginForm is a synchronous Client Component.
 */
export default async function Home() {
  return (
    <>
    <main className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <Suspense fallback={<LoginSkeleton />}>
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
      </Suspense>
    </main>
    </>
  );
}
