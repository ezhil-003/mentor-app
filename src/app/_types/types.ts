import type { Prisma } from "../../../generated/prisma/client";
export type User = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phonenumber: string;
  countrycode: string;
};

export type CalendarDay = {
  id: string;
  date: Date;
  isGapDay: boolean;
  isActive: boolean;
  capacity: number;
  confirmedCount: number;
  remainingSeats: number;
  isAvailable: boolean;
  module: {
    id: string;
    name: string;
    order: number;
    durationHours: number;
  } | null;
};

export type Booking = {
  id: string;
  userId: string;
  status: "DRAFT" | "CONFIRMED";
  totalHours: number;
  createdAt: Date;
  updatedAt: Date;

  slots: {
    id: string;
    createdAt: Date;
    trainingDayId: string;
    bookingId: string;

    trainingDay: {
      id: string;
      date: Date;
      createdAt: Date;
      moduleId: string | null; // also fix this
      isGapDay: boolean;
      capacity: number;
      isActive: boolean;

      module: {
        id: string;
        name: string;
        order: number;
        durationHours: number;
      } | null; // must allow null
    };
  }[]; // 🔥 THIS IS THE IMPORTANT FIX
} | null;

export type BookingWithSlots = Prisma.BookingGetPayload<{
  include: {
    slots: {
      include: {
        trainingDay: {
          include: {
            module: true;
          };
        };
      };
    };
  };
}> | null;
