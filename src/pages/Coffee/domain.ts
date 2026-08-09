export { firstSundayOfMonth } from '../../domain/cafeSchedule';

export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}
