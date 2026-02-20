"use client";

import { api } from "@/trpc/react";
import { format } from "date-fns";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import type { BookingWithSlots } from "@/app/_types/types";
import { toast } from "sonner";

/**
 * Client Component: ScheduledClassesPage
 * Uses booking prop to render the scheduled classes.
 */

type Props = {
    booking: BookingWithSlots;
};

export default function ScheduledClassesPage({ booking }: Props) {
    const router = useRouter();
    const utils = api.useUtils();

    const removeMutation = api.booking.removeSlot.useMutation({
        onSuccess: async () => {
            await utils.booking.getMyBooking.invalidate();
            await utils.booking.getCalendarMonth.invalidate();
            toast.success("Slot removed successfully");
            router.refresh();
        },
        onError: () => {
            toast.error("Failed to remove slot");
        },
    });

    const groupedByMonth = useMemo(() => {
        if (!booking?.slots) return {};

        return booking.slots.reduce(
            (acc, slot) => {
                const monthKey = format(new Date(slot.trainingDay.date), "MMMM yyyy");

                if (!acc[monthKey]) acc[monthKey] = [];
                acc[monthKey].push(slot);

                return acc;
            },
            {} as Record<string, typeof booking.slots>,
        );
    }, [booking]);

    if (!booking) {
        return (
            <div className="p-10">
                <h1 className="text-2xl font-bold">No Scheduled Classes</h1>
                <Button className="mt-4" onClick={() => router.push("/calendar")}>
                    Add New Slot
                </Button>
            </div>
        );
    }

    const progress = (booking.totalHours / 7) * 100;

    return (
        <div className="p-10 space-y-10 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">Scheduled Classes</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Manage your selected training sessions
                    </p>
                </div>

                <Button onClick={() => router.push("/calendar")} disabled={booking.status === "CONFIRMED"}>
                    Add New Slot
                </Button>
            </div>

            {/* STATUS CARD */}
            <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <Badge
                        variant={booking.status === "CONFIRMED" ? "default" : "secondary"}
                        className="px-3 py-1"
                    >
                        {booking.status}
                    </Badge>

                    <span className="text-sm text-muted-foreground">
                        {booking.totalHours} / 7 hours completed
                    </span>
                </div>

                {/* Status & Progress */}
                <div className="space-y-4">
                    {/* <Badge variant={booking.status === "CONFIRMED" ? "default" : "secondary"}>
          {booking.status}
        </Badge> */}

                    <Progress value={progress} />

                    {booking.status === "DRAFT" && (
                        <div className="p-4 rounded-md bg-yellow-100 text-yellow-800">
                            Your schedule is incomplete. Please select remaining modules.
                        </div>
                    )}

                    {booking.status === "CONFIRMED" && (
                        <div className="text-sm text-green-700 bg-green-100 rounded-md px-4 py-3">
                            You have completed your schedule.
                        </div>
                    )}
                </div>
            </div>

            {/* Month Sections */}
            {Object.entries(groupedByMonth).map(([month, slots]) => (
                <div key={month} className="space-y-6">
                    {/* Month Title */}
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-semibold">{month}</h2>
                        <div className="h-px flex-1 bg-border" />
                    </div>
                    {/* Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-6">
                        {slots.map((slot) => (
                            <div
                                key={slot.id}
                                className="relative flex flex-col justify-between rounded-xl border bg-secondary p-4 h-40 transition-all hover:shadow-md"
                            >
                                {/* Delete button */}
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-red-500"
                                    onClick={() =>
                                        removeMutation.mutate({
                                            trainingDayId: slot.trainingDay.id,
                                        })
                                    }
                                >
                                    ✕
                                </Button>

                                {/* Module Info */}
                                <div>
                                    <p className="text-sm font-medium">Day {slot.trainingDay.module?.order}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {slot.trainingDay.module?.name}
                                    </p>
                                </div>

                                {/* Date */}
                                <div className="text-right">
                                    <p className="text-2xl font-semibold">
                                        {format(new Date(slot.trainingDay.date), "dd")}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {format(new Date(slot.trainingDay.date), "EEE")}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
