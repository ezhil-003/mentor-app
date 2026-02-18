import { Suspense } from "react";
import { LoginForm } from "@/app/_components/forms/login";
export default async function Home() {
  return (
    <main className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <Suspense fallback={<div>Loading...</div>}>
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </Suspense>
    </main>
  );
}
