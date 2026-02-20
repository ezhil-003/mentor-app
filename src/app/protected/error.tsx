"use client";

import { Button } from "@/components/ui/button";

export default function ProtectedError({ reset }: { reset: () => void }) {
  return (
    <div className="p-10">
      <h2 className="text-2xl font-semibold">Dashboard Error</h2>

      <p className="text-muted-foreground mt-2">Something failed while loading your data.</p>

      <Button className="mt-4" onClick={() => reset()}>
        Retry
      </Button>
    </div>
  );
}
