import type { Prisma } from "../../../generated/prisma/client";
import { addExecutionBusinessEvent } from "@/server/logging/execution-context";
import { TRPCError } from "@trpc/server";

const REQUIRED_HOURS = 7;

/**
 * This function is used to submit the booking.
 * It uses the updateBookingSlots function to update the booking slots.
 * @param tx 
 * @param executionContext 
 * @param userId 
 * @param trainingDayIds 
 * @returns { bookingId: string, totalHours: number }
 */
export async function submitBooking(
  tx: Prisma.TransactionClient,
  executionContext: any,
  userId: string,
  trainingDayIds: string[],
) {
  const trainingDays = await tx.trainingDay.findMany({
    where: {
      id: { in: trainingDayIds },
      isActive: true,
    },
    include: {
      module: true,
      bookings: {
        where: {
          booking: { status: "CONFIRMED" },
        },
      },
    },
  });

  if (trainingDays.length !== trainingDayIds.length) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Invalid training day selection.",
    });
  }

  const totalHours = trainingDays.reduce((sum, d) => sum + (d.module?.durationHours ?? 0), 0);

  if (totalHours < REQUIRED_HOURS) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Minimum required hours not met.",
    });
  }

  // prevent duplicate modules
  const moduleIds = trainingDays.map((d) => d.moduleId).filter(Boolean);
  if (new Set(moduleIds).size !== moduleIds.length) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Cannot book same module twice.",
    });
  }

  // capacity check
  for (const day of trainingDays) {
    if (day.bookings.length >= day.capacity) {
      throw new TRPCError({
        code: "CONFLICT",
        message: `Selected date ${day.date.toISOString()} is full.`,
      });
    }
  }

  const existing = await tx.booking.findFirst({
    where: {
      userId,
      status: { in: ["DRAFT", "CONFIRMED"] },
    },
  });

  if (existing) {
    await tx.bookingSlot.deleteMany({
      where: { bookingId: existing.id },
    });

    const updated = await tx.booking.update({
      where: { id: existing.id },
      data: {
        status: "CONFIRMED",
        totalHours,
        slots: {
          create: trainingDayIds.map((id) => ({
            trainingDayId: id,
          })),
        },
      },
    });

    addExecutionBusinessEvent(executionContext, "BOOKING_CONFIRMED", {
      bookingId: updated.id,
      userId,
      totalHours,
    });

    return {
      bookingId: updated.id,
      totalHours,
    };
  }

  const created = await tx.booking.create({
    data: {
      userId,
      status: "CONFIRMED",
      totalHours,
      slots: {
        create: trainingDayIds.map((id) => ({
          trainingDayId: id,
        })),
      },
    },
  });

  addExecutionBusinessEvent(executionContext, "BOOKING_CONFIRMED", {
    bookingId: created.id,
    userId,
    totalHours,
  });

  return {
    bookingId: created.id,
    totalHours,
  };
}
export const getOrCreateActiveBooking = async (tx: Prisma.TransactionClient, userId: string) => {
  const existing = await tx.booking.findFirst({
    where: {
      userId,
      status: {
        in: ["DRAFT", "CONFIRMED"],
      },
    },
    include: {
      slots: true,
    },
  });

  if (existing) return existing;

  return tx.booking.create({
    data: {
      userId,
      status: "DRAFT",
      totalHours: 0,
    },
    include: {
      slots: true,
    },
  });
};

/**
 * This function is used to update the booking slots.
 * It uses the getOrCreateActiveBooking function to get the active booking.
 * @param tx - The transaction client.
 * @param userId - The user ID.
 * @param trainingDayIds - The training day IDs.
 * @returns The booking ID and status.
 */
export const updateBookingSlots = async (
  tx: Prisma.TransactionClient,
  userId: string,
  trainingDayIds: string[],
) => {
  const booking = await getOrCreateActiveBooking(tx, userId);

  await tx.bookingSlot.deleteMany({
    where: { bookingId: booking.id },
  });

  await tx.bookingSlot.createMany({
    data: trainingDayIds.map((id) => ({
      bookingId: booking.id,
      trainingDayId: id,
    })),
  });

  const total = trainingDayIds.length;

  const newStatus = total === 7 ? "CONFIRMED" : "DRAFT";

  const updated = await tx.booking.update({
    where: { id: booking.id },
    data: {
      totalHours: total,
      status: newStatus,
    },
  });

  return {
    bookingId: updated.id,
    status: updated.status,
  };
};
