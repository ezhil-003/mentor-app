import { EventCalendar } from "@/app/_components/dashboard/EventCalender";
import { api } from "@/trpc/server";
import { Suspense } from "react";
import type { Metadata } from "next";
import { DashboardSkeleton } from "@/app/_components/skeletons/DashboardSkeleton";

export const metadata: Metadata = {
  title: "Dashboard - Mentor Merlin",
  description: "Select and manage your training modules.",
};

/**
 * Server Component: DashboardPage
 * Uses TRPC prefetching to populate the Query cache on the server,
 * enabling HydrateClient to pass it seamlessly to Client Components without prop drilling.
 */
export default async function DashboardPage() {
  const calendar = await api.booking.getCalendarMonth({
    month: 1,
    year: 2026,
  });
  const bookings = await api.booking.getMyBooking();
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <h3 className="text-2xl font-semibold mb-6">Select your Slots</h3>
        <Suspense fallback={<DashboardSkeleton />}>
          <EventCalendar calendar={calendar} booking={bookings} />
        </Suspense>
      </div>
    </div>
  );
}
