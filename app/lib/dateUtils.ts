import { format, parseISO, formatISO } from 'date-fns';

// Get the local time zone offset in minutes
const localTimeZoneOffset = new Date().getTimezoneOffset();

export function convertUTCToLocal(utcDateString: string): Date {
  return new Date(utcDateString);
}

export function convertLocalToUTC(localDate: Date): string {
  return formatISO(localDate);
}

export function formatLocalDate(date: Date, formatString: string): string {
  return format(date, formatString);
}

export const formatters = {
  appointment: (date: Date) => format(date, 'MMMM d, yyyy h:mm a'),
  birthdate: (date: Date) => format(date, 'MMMM d, yyyy'),
  shortDate: (date: Date) => format(date, 'MMM d, yyyy'),
  time: (date: Date) => format(date, 'h:mm a'),
  weekday: (date: Date) => format(date, 'EEEE'),
  fullDateTime: (date: Date) => format(date, 'EEEE, MMMM d, yyyy h:mm a')
}