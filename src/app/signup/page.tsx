import { cn } from "@/lib/utils";
import { SignupForm } from "@/app/_components/forms/signup";
import { Suspense } from "react";
export default async function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <SignupForm />
      </div>
    </div>
    </Suspense>
  );
}
