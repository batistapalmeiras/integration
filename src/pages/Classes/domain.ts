export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

export function isSunday(dateStr: string): boolean {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).getDay() === 0;
}

export function nextSundays(firstDate: string): [string, string, string, string] {
  const [year, month, day] = firstDate.split('-').map(Number);
  const base = new Date(year, month - 1, day);

  const dates = [0, 7, 14, 21].map((offset) => {
    const date = new Date(base);
    date.setDate(date.getDate() + offset);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  return dates as [string, string, string, string];
}
