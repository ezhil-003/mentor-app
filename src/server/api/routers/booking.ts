import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { runTrackedTransaction } from "@/server/db/runTrackedTransaction";
import { addSlotToDraft, confirmDraftBooking,submitBooking } from "@/server/domain/booking";
import { startOfMonth, endOfMonth,addMonths } from "date-fns";

export const bookingRouter = createTRPCRouter({
  addSlot: protectedProcedure
    .input(z.object({ trainingDayId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return runTrackedTransaction(ctx.db, ctx.executionContext, async (tx) => {
        return addSlotToDraft(tx, ctx.executionContext, ctx.session.user.id, input.trainingDayId);
      });
    }),

  confirmBooking: protectedProcedure
    .input(z.object({ bookingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return runTrackedTransaction(ctx.db, ctx.executionContext, async (tx) => {
        return confirmDraftBooking(tx, ctx.executionContext, ctx.session.user.id, input.bookingId);
      });
    }),
  // -------------------------------
  // GET CALENDAR MONTH
  // -------------------------------
  getCalendarMonth: protectedProcedure
    .input(
      z.object({
        year: z.number(),
        month: z.number(), // 0-indexed (JS month)
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
  submitBooking: protectedProcedure
      .input(
        z.object({
          trainingDayIds: z.array(z.string()).min(1),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        return runTrackedTransaction(ctx.db, ctx.executionContext, async (tx) => {
          return submitBooking(
            tx,
            ctx.executionContext,
            ctx.session.user.id,
            input.trainingDayIds,
          );
        });
      }),
});
