import type { Prisma } from "../../../generated/prisma/client";
import { addExecutionBusinessEvent } from "@/server/logging/execution-context";
import { TRPCError } from "@trpc/server";
const REQUIRED_HOURS = 7;

export const getOrCreateDraftBooking = async (tx: Prisma.TransactionClient, userId: string) => {
  let booking = await tx.booking.findFirst({
    where: {
      userId,
      status: "DRAFT",
    },
  });

  if (!booking) {
    booking = await tx.booking.create({
      data: {
        userId,
        status: "DRAFT",
        totalHours: 0,
      },
    });
  }

  return booking;
};

export const confirmDraftBooking = async (
  tx: Prisma.TransactionClient,
  ctx: any,
  userId: string,
  bookingId: string,
) => {
  const booking = await tx.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking || booking.userId !== userId) {
    throw new Error("Booking not found");
  }

  if (booking.status !== "DRAFT") {
    throw new Error("Already finalized");
  }

  if (booking.totalHours < REQUIRED_HOURS) {
    throw new Error("Insufficient hours");
  }

  await tx.booking.update({
    where: { id: bookingId },
    data: { status: "CONFIRMED" },
  });

  addExecutionBusinessEvent(ctx, "booking_confirmed", {
    bookingId,
  });

  return true;
};

export const addSlotToDraft = async (
  tx: Prisma.TransactionClient,
  ctx: any,
  userId: string,
  trainingDayId: string,
) => {
  const booking = await getOrCreateDraftBooking(tx, userId);

  if (booking.status !== "DRAFT") {
    throw new Error("Booking not editable");
  }

  const trainingDay = await tx.trainingDay.findUnique({
    where: { id: trainingDayId },
    include: { module: true },
  });

  if (!trainingDay || !trainingDay.isActive || trainingDay.isGapDay) {
    throw new Error("Invalid training day");
  }

  // Check module uniqueness
  const existingSlots = await tx.bookingSlot.findMany({
    where: { bookingId: booking.id },
    include: { trainingDay: true },
  });

  const moduleAlreadySelected = existingSlots.some(
    (slot) => slot.trainingDay.moduleId && slot.trainingDay.moduleId === trainingDay.moduleId,
  );

  if (moduleAlreadySelected) {
    throw new Error("Module already selected");
  }

  // Capacity check
  const slotCount = await tx.bookingSlot.count({
    where: { trainingDayId },
  });

  if (slotCount >= trainingDay.capacity) {
    throw new Error("Capacity full");
  }

  await tx.bookingSlot.create({
    data: {
      bookingId: booking.id,
      trainingDayId,
    },
  });

  const updated = await tx.booking.update({
    where: { id: booking.id },
    data: {
      totalHours: {
        increment: trainingDay.module?.durationHours ?? 1,
      },
    },
  });

  addExecutionBusinessEvent(ctx, "booking_slot_added", {
    bookingId: booking.id,
    trainingDayId,
  });

  return updated;
};


export async function submitBooking(
  tx: Prisma.TransactionClient,
  executionContext: any,
  userId: string,
  trainingDayIds: string[],
) {
  // 1️⃣ Fetch training days with module & bookings
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

  // 2️⃣ Validate hours
  const totalHours = trainingDays.reduce(
    (sum, d) => sum + (d.module?.durationHours ?? 0),
    0,
  );

  if (totalHours < REQUIRED_HOURS) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Minimum required hours not met.",
    });
  }

  // 3️⃣ Prevent duplicate modules
  const moduleIds = trainingDays
    .map((d) => d.moduleId)
    .filter(Boolean);

  const uniqueModules = new Set(moduleIds);

  if (uniqueModules.size !== moduleIds.length) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Cannot book same module twice.",
    });
  }

  // 4️⃣ Check capacity
  for (const day of trainingDays) {
    if (day.bookings.length >= day.capacity) {
      throw new TRPCError({
        code: "CONFLICT",
        message: `Selected date ${day.date.toISOString()} is full.`,
      });
    }
  }

  // 5️⃣ Create booking
  const booking = await tx.booking.create({
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

  // 6️⃣ Log business event
  addExecutionBusinessEvent(executionContext, "BOOKING_CONFIRMED", {
    bookingId: booking.id,
    userId,
    totalHours,
  });

  return {
    bookingId: booking.id,
    totalHours,
  };
}