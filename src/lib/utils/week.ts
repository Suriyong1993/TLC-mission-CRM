import { BUDDHIST_ERA_OFFSET, THAI_MONTHS_SHORT } from "@/lib/constants";

/**
 * Get ISO week number and year from a date
 */
export function getISOWeek(date: Date): { week: number; year: number } {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const yearStart = new Date(d.getFullYear(), 0, 4);
  const weekNumber =
    Math.round(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { week: weekNumber, year: d.getFullYear() };
}

/**
 * Get current ISO week info
 */
export function getCurrentWeek() {
  return getISOWeek(new Date());
}

/**
 * Format a date in Thai Buddhist Era format
 * e.g., "22 มี.ค. 2569"
 */
export function formatThaiDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const day = d.getDate();
  const month = THAI_MONTHS_SHORT[d.getMonth()];
  const year = d.getFullYear() + BUDDHIST_ERA_OFFSET;
  return `${day} ${month} ${year}`;
}

/**
 * Format a date with full Thai month
 * e.g., "22 มีนาคม 2569"
 */
export function formatThaiDateFull(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const day = d.getDate();
  const monthIndex = d.getMonth();
  const year = d.getFullYear() + BUDDHIST_ERA_OFFSET;
  const { THAI_MONTHS_FULL } = require("@/lib/constants");
  return `${day} ${THAI_MONTHS_FULL[monthIndex]} ${year}`;
}

/**
 * Get week range string
 * e.g., "15-21 มี.ค. 2569"
 */
export function formatWeekRange(week: number, year: number): string {
  const jan1 = new Date(year, 0, 1);
  const dayOfWeek = jan1.getDay();
  const offset = dayOfWeek <= 4 ? 1 - dayOfWeek : 8 - dayOfWeek;
  const weekStart = new Date(year, 0, offset + (week - 1) * 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const startDay = weekStart.getDate();
  const startMonth = THAI_MONTHS_SHORT[weekStart.getMonth()];
  const endDay = weekEnd.getDate();
  const endMonth = THAI_MONTHS_SHORT[weekEnd.getMonth()];
  const buddhistYear = weekEnd.getFullYear() + BUDDHIST_ERA_OFFSET;

  if (weekStart.getMonth() === weekEnd.getMonth()) {
    return `${startDay}-${endDay} ${startMonth} ${buddhistYear}`;
  }
  return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${buddhistYear}`;
}
