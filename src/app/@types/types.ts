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