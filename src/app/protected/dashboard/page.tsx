import { EventCalendar } from "@/app/_components/dashboard/EventCalender";
import { api } from "@/trpc/server";

export default async function DashboardPage() {
  const calendar = await api.booking.getCalendarMonth({
    month: 1,
    year: 2026,
  });
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <h3 className="text-2xl font-semibold mb-6">Select your Slots</h3>
        <EventCalendar calendar={calendar} />
      </div>
    </div>
  );
}
