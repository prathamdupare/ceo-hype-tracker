import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { differenceInMonths, addMonths, isBefore } from "date-fns";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function getStats(dateAnnounced: string, deadlineMonths: number) {
  const now = new Date();
  const announced = new Date(dateAnnounced);
  const deadlineDate = addMonths(announced, deadlineMonths);

  return {
    monthsSinceLast: differenceInMonths(now, announced),
    monthsRemaining: deadlineMonths > 0 ? differenceInMonths(deadlineDate, now) : null,
    isExpired: deadlineMonths > 0 ? isBefore(deadlineDate, now) : false,
  };
}
