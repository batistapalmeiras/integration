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
