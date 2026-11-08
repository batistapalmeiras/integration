// Libs
import { parseDateKey, toDateKey } from 'bp-kit';

export function weeklyLessonDates(firstDate: string): [string, string, string, string] {
  const base = parseDateKey(firstDate) ?? new Date();
  const dates = [0, 7, 14, 21].map((offset) => {
    const date = new Date(base);
    date.setDate(date.getDate() + offset);
    return toDateKey(date);
  });
  return dates as [string, string, string, string];
}
