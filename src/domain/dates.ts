// Libs
import { toDateKey } from 'bp-kit';

export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

export function formatTimestampDate(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

export function formatTimestamp(timestamp: string): string {
  const moment = new Date(timestamp);
  const date = moment.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const time = moment.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' });
  return `${date} ${time}`;
}

export function timestampDateKey(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
}

export function todayKey(): string {
  return timestampDateKey(new Date().toISOString());
}

export function weekdayLabel(dateKey: string): string {
  const weekday = new Date(`${dateKey}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'long' });
  return weekday.charAt(0).toUpperCase() + weekday.slice(1).replace('-feira', '');
}

export function monthName(month: number): string {
  const name = new Date(2000, month - 1, 1).toLocaleDateString('pt-BR', { month: 'long' });
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function shortMonthName(month: number): string {
  return new Date(2000, month - 1, 1).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
}

export const isFutureDate = (date: Date): boolean => toDateKey(date) > todayKey();
