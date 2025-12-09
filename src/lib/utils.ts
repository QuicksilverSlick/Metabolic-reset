import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { differenceInDays } from "date-fns"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
/**
 * Calculates the current progress of the 28-day challenge based on a start date.
 * Returns day number (1-based), week number (1-based), and percentage (0-100).
 */
export function getChallengeProgress(startDate: string | number | Date) {
  const start = new Date(startDate);
  const now = new Date();
  // Calculate days passed (1-based)
  // If start date is today, difference is 0, so day is 1.
  // We use Math.max(1, ...) to ensure we don't show Day 0 or negative if timezone weirdness happens slightly
  const daysPassed = Math.max(1, differenceInDays(now, start) + 1);
  // Calculate week (1-4, or more if post-challenge)
  const week = Math.ceil(daysPassed / 7);
  // Calculate percentage (capped at 100 for visual rings usually)
  const progressPercentage = Math.min(100, (daysPassed / 28) * 100);
  return {
    day: daysPassed,
    week,
    progressPercentage
  };
}