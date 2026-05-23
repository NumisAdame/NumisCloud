import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format a year integer for display: negative → "X a.C.", positive → "X d.C." (d.C. omitted if > 500) */
export function formatYear(year: number | null | undefined): string {
  if (year == null) return '';
  if (year < 0) return `${Math.abs(year)} a.C.`;
  if (year <= 500) return `${year} d.C.`;
  return `${year}`;
}

/** Format a year range for display */
export function formatYearRange(year: number | null | undefined, yearEnd: number | null | undefined): string {
  if (year == null) return '';
  const start = formatYear(year);
  if (yearEnd == null) return start;
  return `${start} - ${formatYear(yearEnd)}`;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}