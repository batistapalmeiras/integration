export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

export function formatTimestampDate(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

export function todayKey(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
}

export function weekdayLabel(dateKey: string): string {
  const weekday = new Date(`${dateKey}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'long' });
  return weekday.charAt(0).toUpperCase() + weekday.slice(1).replace('-feira', '');
}

export function parseTypedDate(value: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return null;
  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const valid =
    date.getFullYear() === Number(year) && date.getMonth() === Number(month) - 1 && date.getDate() === Number(day);
  return valid ? `${year}-${month}-${day}` : null;
}

export function monthName(month: number): string {
  const name = new Date(2000, month - 1, 1).toLocaleDateString('pt-BR', { month: 'long' });
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function shortMonthName(month: number): string {
  return new Date(2000, month - 1, 1).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
}
