export interface MemberBirthday {
  personId: string;
  name: string;
  birthDate: string;
  phone: string | null;
}

const MAX_AGE = 120;
const MONTHS = 12;

export const birthdayMonth = (birthDate: string) => Number(birthDate.slice(5, 7));

export const shiftMonth = (month: number, step: number) => ((((month - 1 + step) % MONTHS) + MONTHS) % MONTHS) + 1;

const birthdayDay = (birthDate: string) => Number(birthDate.slice(8, 10));

export function birthdaysInMonth(birthdays: MemberBirthday[], month: number): MemberBirthday[] {
  return birthdays
    .filter((birthday) => birthdayMonth(birthday.birthDate) === month)
    .sort((a, b) => birthdayDay(a.birthDate) - birthdayDay(b.birthDate) || a.name.localeCompare(b.name, 'pt-BR'));
}

export function upcomingBirthdaysThisMonth(birthdays: MemberBirthday[], today: string): MemberBirthday[] {
  return birthdaysInMonth(birthdays, birthdayMonth(today)).filter(
    (birthday) => birthdayDay(birthday.birthDate) >= birthdayDay(today),
  );
}

export function isBirthdayToday(birthDate: string, today: string): boolean {
  return birthDate.slice(5) === today.slice(5);
}

export function ageTurning(birthDate: string, year: number): number | null {
  const age = year - Number(birthDate.slice(0, 4));
  return age > 0 && age <= MAX_AGE ? age : null;
}

export function birthdayAgeLabel(birthDate: string, year: number, today: string): string | null {
  const age = ageTurning(birthDate, year);
  if (age === null) return null;
  const passed = `${year}${birthDate.slice(4)}` < today;
  return `${passed ? 'Completou' : 'Completa'} ${age} anos`;
}

export function birthdaysListText(
  birthdays: MemberBirthday[],
  year: number,
  monthLabel: string,
  formatPhone: (phone: string) => string,
): string {
  const lines = birthdays.map((birthday) =>
    [
      `${birthday.birthDate.slice(8, 10)}/${birthday.birthDate.slice(5, 7)}`,
      birthday.name,
      birthday.phone ? formatPhone(birthday.phone) : 'sem celular',
    ].join(' · '),
  );
  return [`Aniversariantes de ${monthLabel} de ${year}`, ...lines].join('\n\n');
}
