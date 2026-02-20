import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { runTrackedTransaction } from "@/server/db/runTrackedTransaction";
import { updateBookingSlots } from "@/server/domain/booking";
import { startOfMonth, endOfMonth, addMonths } from "date-fns";

export const bookingRouter = createTRPCRouter({
  /**
   * This procedure is used to get the calendar month.
   * It returns the training days for the given month.
   */
  getCalendarMonth: protectedProcedure
    .input(
      z.object({
        year: z.number(),
        month: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const start = startOfMonth(new Date(input.year, input.month));
      const end = endOfMonth(addMonths(start, 3));

      const trainingDays = await ctx.db.trainingDay.findMany({
        where: {
          date: {
            gte: start,
            lte: end,
          },
        },
        include: {
          module: true,
          _count: {
            select: {
              bookings: {
                where: {
                  booking: {
                    status: "CONFIRMED",
                  },
                },
              },
            },
          },
        },
        orderBy: {
          date: "asc",
        },
      });

      const result = trainingDays.map((day) => {
        const confirmedCount = day._count.bookings;
        const remainingSeats = Math.max(day.capacity - confirmedCount, 0);

        return {
          id: day.id,
          date: day.date,
          isGapDay: day.isGapDay,
          isActive: day.isActive,
          capacity: day.capacity,
          confirmedCount,
          remainingSeats,
          isAvailable: day.isActive && !day.isGapDay && remainingSeats > 0,
          module: day.module
            ? {
                id: day.module.id,
                name: day.module.name,
                order: day.module.order,
                durationHours: day.module.durationHours,
              }
            : null,
        };
      });

      return result;
    }),

  /**
   * This procedure is used to submit the booking.
   * It uses the updateBookingSlots function to update the booking slots.
   */
  submitBooking: protectedProcedure
    .input(z.object({ trainingDayIds: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      return runTrackedTransaction(ctx.db, ctx.executionContext, async (tx) => {
        return updateBookingSlots(tx, ctx.session.user.id, input.trainingDayIds);
      });
    }),

  /**
   * This procedure is used to get the user's booking.
   * It returns the booking if the user has a booking.
   */ 
  getMyBooking: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.booking.findFirst({
      where: {
        userId: ctx.session.user.id,
        status: {
          in: ["DRAFT", "CONFIRMED"],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        slots: {
          include: {
            trainingDay: {
              include: {
                module: true,
              },
            },
          },
        },
      },
    });
  }),

  /**
   * This procedure is used to remove a slot from the booking.
   * It uses the updateBookingSlots function to update the booking slots.
   */
  removeSlot: protectedProcedure
    .input(z.object({ trainingDayId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return runTrackedTransaction(ctx.db, ctx.executionContext, async (tx) => {
        const booking = await tx.booking.findFirst({
          where: {
            userId: ctx.session.user.id,
            status: { in: ["DRAFT", "CONFIRMED"] },
          },
        });

        if (!booking) return;

        await tx.bookingSlot.deleteMany({
          where: {
            bookingId: booking.id,
            trainingDayId: input.trainingDayId,
          },
        });

        const remaining = await tx.bookingSlot.count({
          where: { bookingId: booking.id },
        });

        const newStatus = remaining === 7 ? "CONFIRMED" : "DRAFT";

        await tx.booking.update({
          where: { id: booking.id },
          data: {
            totalHours: remaining,
            status: newStatus,
          },
        });

        return { remaining, status: newStatus };
      });
    }),
});
