import ScheduledClassesClient from "@/app/_components/dashboard/scheduledClasses";
import { api } from "@/trpc/server";
import { Suspense } from "react";
import type { Metadata } from "next";
import { ScheduledSkeleton } from "@/app/_components/skeletons/ScheduledSkeleton";

export const metadata: Metadata = {
  title: "Scheduled Classes - Mentor Merlin",
  description: "View and manage your scheduled classes.",
};

/**
 * Server Component: ScheduledClassesPage
 * Prefetches booking data to be hydrated by the client component, avoiding waterfall data fetching.
 */
export default async function ScheduledClassesPage() {
  const booking = await api.booking.getMyBooking();

  return (
    <Suspense fallback={<ScheduledSkeleton />}>
      <ScheduledClassesClient booking={booking} />
    </Suspense>
  );
}
