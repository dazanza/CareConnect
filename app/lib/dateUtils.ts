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