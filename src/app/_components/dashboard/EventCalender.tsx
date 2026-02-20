"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  isSameMonth,
} from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Clock, ArrowBigLeft, ArrowBigRight } from "lucide-react";
import type { CalendarDay, BookingWithSlots } from "@/app/_types/types";
import ConfirmationDialog from "./ConfirmationDialog";

type EventCalendarProps = {
  calendar: CalendarDay[];
  booking: BookingWithSlots | null;
};

const REQUIRED_HOURS = 7;
const truncate = (text: string) => (text.length > 10 ? text.slice(0, 10) + "..." : text);

export function EventCalendar({ calendar, booking }: EventCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedTrainingDayIds, setSelectedTrainingDayIds] = useState<string[]>([]);
  const isConfirmed = booking?.status === "CONFIRMED";

  useEffect(() => {
    if (!booking) {
      setSelectedTrainingDayIds([]);
      return;
    }

    setSelectedTrainingDayIds(booking.slots.map((s) => s.trainingDayId));
  }, [booking]);

  const selectedDays = useMemo(() => {
    return selectedTrainingDayIds
      .map((id) => calendar.find((d) => d.id === id))
      .filter(Boolean)
      .sort((a, b) => new Date(a!.date).getTime() - new Date(b!.date).getTime());
  }, [selectedTrainingDayIds, calendar]) as CalendarDay[];

  // /* ---------------------- Month Grid Calculation ---------------------- */
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const firstMonth = startOfMonth(new Date());
  const lastMonth = startOfMonth(addMonths(firstMonth, 2));

  const isPrevDisabled = startOfMonth(currentMonth) <= firstMonth;

  const isNextDisabled = startOfMonth(currentMonth) >= lastMonth;

  const days = useMemo(() => {
    const arr: Date[] = [];
    let day = calendarStart;
    while (day <= calendarEnd) {
      arr.push(day);
      day = addDays(day, 1);
    }
    return arr;
  }, [calendarStart, calendarEnd]);

  /* ---------------------- Map For Fast Lookup ---------------------- */

  const calendarMap = useMemo(() => {
    const map = new Map<string, CalendarDay>();
    calendar.forEach((day) => {
      map.set(format(new Date(day.date), "yyyy-MM-dd"), day);
    });
    return map;
  }, [calendar]);

  /* ---------------------- Hours Logic ---------------------- */

  const totalHours = selectedDays.length;
  const remainingHours = REQUIRED_HOURS - totalHours;
  const isRequirementMet = totalHours >= REQUIRED_HOURS;
  const progressPercent = Math.min((totalHours / REQUIRED_HOURS) * 100, 100);

  /* ---------------------- Handlers ---------------------- */

  const toggleDate = useCallback((trainingDayId: string) => {
    if (isConfirmed) return;
    setSelectedTrainingDayIds((prev) => {
      if (prev.includes(trainingDayId)) {
        return prev.filter((id) => id !== trainingDayId);
      }
      if (prev.length >= REQUIRED_HOURS) return prev;
      return [...prev, trainingDayId];
    });
  }, []);

  const handleRemove = useCallback((trainingDayId: string) => {
    setSelectedTrainingDayIds((prev) => prev.filter((id) => id !== trainingDayId));
  }, []);

  return (
    <div className="grid grid-cols-12 items-start gap-8">
      <div className="col-span-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={isPrevDisabled}
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="border-gray-600/30 disabled:text-gray-400/90"
            >
              <ArrowBigLeft />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={isNextDisabled}
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="border-gray-600/30 disabled:text-gray-400/90"
            >
              <ArrowBigRight />
            </Button>
          </div>
        </div>

        {isConfirmed && (
          <div className="mb-6 rounded-xl border bg-green-100 p-4 text-green-700">
            You have completed your schedule. You can modify your slots from the Scheduled Classes
            page.
          </div>
        )}

        {/* Week Header */}
        <div className="text-muted-foreground mb-2 grid grid-cols-7 text-sm font-medium">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-center">
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-3">
          {days.map((date, index) => {
            const dateKey = format(date, "yyyy-MM-dd");
            const dayData = calendarMap.get(dateKey);

            const isCurrentMonth = isSameMonth(date, monthStart);
            const isSelected = dayData && selectedTrainingDayIds.includes(dayData.id);
            const isModuleAlreadySelected =
              dayData?.module &&
              selectedDays.some((selectedDays) => {
                const selectedKey = format(selectedDays.date, "yyyy-MM-dd");
                const selectedDay = calendarMap.get(selectedKey);
                return selectedDay?.module?.id === dayData.module?.id;
              });

            const disabled =
              isConfirmed || // 🔥 LOCK EVERYTHING
              !isCurrentMonth ||
              !dayData ||
              !dayData.isAvailable ||
              dayData.isGapDay ||
              (isModuleAlreadySelected && !isSelected);

            const isFull = dayData && dayData.remainingSeats === 0;
            return (
              <div
                key={index}
                onClick={() => !disabled && dayData && toggleDate(dayData.id)}
                className={cn(
                  "relative flex h-32 flex-col justify-between rounded-xl border p-3 transition-all",
                  isCurrentMonth ? "bg-secondary" : "bg-muted/30 text-muted-foreground",
                  disabled && "bg-muted pointer-events-none opacity-40",
                  isSelected && "bg-primary text-background border-primary",
                  isFull && "bg-red-100 text-red-600 pointer-events-none",
                )}
              >
                {/* Topic Info */}
                {dayData?.module && !dayData.isGapDay && (
                  <div>
                    <p className="text-sm font-medium">Day {dayData.module.order}</p>
                    <span
                      className={cn("bg-muted text-foreground rounded-full px-2 py-1 text-[10px]")}
                    >
                      {truncate(dayData.module.name)}
                    </span>
                  </div>
                )}

                {/* Date Number */}
                <span className="absolute right-3 bottom-2 text-2xl font-medium">
                  {format(date, "dd")}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      {/* Time Summary */}
      <div className="sticky top-10 col-span-4">
        <div className="bg-card space-y-6 rounded-xl border p-6 shadow-sm">
          {/* Time Summary */}
          <div className="space-y-4">
            <div className="bg-muted flex items-center justify-between rounded-2xl px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="bg-background flex h-9 w-9 items-center justify-center rounded-full border">
                  <Clock />
                </div>
                <span className="text-xl font-semibold">
                  {totalHours.toString().padStart(2, "0")}:00 hrs
                </span>
              </div>

              <div className="bg-border h-8 w-px" />

              <div
                className={cn(
                  "text-xl font-semibold",
                  isRequirementMet ? "text-green-600" : "text-red-500",
                )}
              >
                {Math.max(remainingHours, 0).toString().padStart(2, "0")}
                :00 hs
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
              <div
                className={cn(
                  "h-full transition-all duration-300",
                  isRequirementMet ? "bg-green-600" : "bg-primary",
                )}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Selected Slots */}
            <div>
              <h3 className="mb-4 text-lg font-semibold">Selected Slots ({selectedDays.length})</h3>

              {selectedDays.length === 0 ? (
                <div className="bg-muted/30 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-600/30 px-4 py-10 text-center">
                  <div className="bg-background mb-4 flex h-12 w-12 items-center justify-center rounded-full border">
                    <Clock className="text-muted-foreground h-5 w-5" />
                  </div>

                  <p className="mb-1 text-sm font-medium">No training slots selected</p>

                  <p className="text-muted-foreground max-w-[220px] text-xs">
                    Select available dates from the calendar to build your required hours.
                  </p>
                </div>
              ) : (
                <div className="max-h-[300px] space-y-3 overflow-y-auto pr-1">
                  {selectedDays.map((day) => {
                    const date = day.date;
                    const dateKey = format(date, "yyyy-MM-dd");
                    const dayData = calendarMap.get(dateKey);

                    return (
                      <div
                        key={day?.id}
                        className="bg-muted/40 flex items-center justify-between rounded-lg border px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-medium">{format(day.date, "dd MMM yyyy")}</p>
                          <p className="text-muted-foreground text-xs">
                            Day {dayData?.module?.order} – {dayData?.module?.name}
                          </p>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          className="disabled:border-muted border-1 disabled:text-muted-foreground disabled:pointer-events-none"
                          disabled={isConfirmed}
                          onClick={() => handleRemove(day.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Submit Section */}
            <div className="border-t pt-4">
              {!isConfirmed && (
                <ConfirmationDialog
                  isRequirementMet={isRequirementMet}
                  selectedTrainingDayIds={selectedTrainingDayIds}
                  setSelectedTrainingDayIds={setSelectedTrainingDayIds}
                  totalHours={totalHours}
                  requiredHours={REQUIRED_HOURS}
                  calendar={calendar}
                />
              )}
              {!isRequirementMet && (
                <p className="mt-2 text-center text-xs text-red-500">
                  Minimum {REQUIRED_HOURS} hours required
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
