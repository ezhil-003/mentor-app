"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-6">
      <h1 className="text-4xl font-bold">Something went wrong</h1>

      <p className="text-muted-foreground">An unexpected error occurred.</p>

      <Button onClick={() => reset()}>Try Again</Button>
    </div>
  );
}
