"use client";
import React, { useMemo, useTransition, type SetStateAction } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import type { CalendarDay } from "@/app/@types/types";
import { api } from "@/trpc/react";
import { toast } from "sonner";

type DialogProps = {
  isRequirementMet: boolean;
  selectedTrainingDayIds: string[];
  setSelectedTrainingDayIds: React.Dispatch<SetStateAction<string[]>>;
  calendar: CalendarDay[];
  totalHours: number;
  requiredHours: number;
};

export default function ConfirmationDialog({
  isRequirementMet,
  selectedTrainingDayIds,
  setSelectedTrainingDayIds,
  totalHours,
  requiredHours,
  calendar,
}: DialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isPendingTransition, startTransition] = useTransition();
  const utils = api.useUtils();
  const submitMutation = api.booking.submitBooking.useMutation({
      onSuccess: async (data) => {
        // data should contain bookingId from backend
        await utils.booking.getCalendarMonth.invalidate();
  
        startTransition(() => {
          setSelectedTrainingDayIds([]);
          setOpen(false);
        });
  
        toast("Booking Confirmed 🎉", {
          description: `Booking ID: ${data.bookingId}`,
        });
      },
    });

  const selectedDays = useMemo(() => {
    return selectedTrainingDayIds.map((id) => calendar.find((d) => d.id === id)).filter(Boolean);
  }, [selectedTrainingDayIds, calendar]);
  
  const isSubmitting =
      submitMutation.isPending || isPendingTransition;

  return (
    <Dialog open={open} onOpenChange={(next) => {
            if (!isSubmitting) setOpen(next); // prevent backdrop close while submitting
          }}>
      <DialogTrigger asChild>
        <Button className="w-full h-11 text-base" disabled={!isRequirementMet}>
          Confirm Booking
        </Button>
      </DialogTrigger>

      <DialogContent onPointerDownOutside={(e) => {
                if (isSubmitting) e.preventDefault();
              }}
              onEscapeKeyDown={(e) => {
                if (isSubmitting) e.preventDefault();
              }} className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Review Selected Slots</DialogTitle>
        </DialogHeader>

        {/* Slot Grid */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2">
          {selectedDays.map((day) => (
            <div
              key={day!.id}
              className="rounded-xl bg-primary text-primary-foreground flex flex-col justify-between p-4 space-y-1"
            >
              <p className="text-lg font-semibold">{format(new Date(day!.date), "dd")}</p>
              <p className="text-sm">{format(new Date(day!.date), "MMMM")}</p>
              {day!.module && (
                <>
                  <p className="text-sm">Day {day!.module.order}</p>
                  <p className="text-xs opacity-80">{day!.module.name}</p>
                </>
              )}

              <Button
                size="sm"
                variant="secondary"
                className="w-full mt-2"
                onClick={() =>
                  setSelectedTrainingDayIds((prev) => prev.filter((id) => id !== day!.id))
                }
              >
                Remove
              </Button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-6 flex items-center justify-between bg-muted rounded-xl p-4">
          <span className="font-medium">Total Hours</span>
          <span className="text-lg font-semibold">
            {totalHours} / {requiredHours} hrs
          </span>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            disabled={!isRequirementMet || submitMutation.isPending}
            onClick={() =>
              submitMutation.mutate({
                trainingDayIds: selectedTrainingDayIds,
              })
            }
          >
            {submitMutation.isPending ? "Submitting..." : "Confirm & Lock"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
