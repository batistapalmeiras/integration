// Local
import { parseDateKey, toDateKey } from '../../domain/dates';

export function weeklyLessonDates(firstDate: string): [string, string, string, string] {
  const base = parseDateKey(firstDate);
  const dates = [0, 7, 14, 21].map((offset) => {
    const date = new Date(base);
    date.setDate(date.getDate() + offset);
    return toDateKey(date);
  });
  return dates as [string, string, string, string];
}
