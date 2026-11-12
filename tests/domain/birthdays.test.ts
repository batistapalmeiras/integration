// Local
import {
  ageTurning,
  birthdayAgeLabel,
  birthdaysInMonth,
  birthdaysListText,
  isBirthdayToday,
  MemberBirthday,
  shiftMonth,
  upcomingBirthdaysThisMonth,
} from '../../src/domain/birthdays';

const birthday = (name: string, birthDate: string, phone: string | null = null): MemberBirthday => ({
  personId: name,
  name,
  birthDate,
  phone,
});

const BIRTHDAYS = [
  birthday('Paula', '1990-11-20'),
  birthday('Ana', '1985-11-03'),
  birthday('Bruno', '2001-11-20'),
  birthday('Carla', '1970-12-01'),
  birthday('Davi', '1995-11-07'),
];

describe('birthdaysInMonth', () => {
  it('keeps only the month and orders by day, then name', () => {
    expect(birthdaysInMonth(BIRTHDAYS, 11).map((b) => b.name)).toEqual(['Ana', 'Davi', 'Bruno', 'Paula']);
  });

  it('returns nothing for a month without birthdays', () => {
    expect(birthdaysInMonth(BIRTHDAYS, 1)).toEqual([]);
  });
});

describe('upcomingBirthdaysThisMonth', () => {
  it('starts at today and stops at the end of the month', () => {
    expect(upcomingBirthdaysThisMonth(BIRTHDAYS, '2026-11-07').map((b) => b.name)).toEqual(['Davi', 'Bruno', 'Paula']);
  });

  it('is empty once the month has no birthdays left', () => {
    expect(upcomingBirthdaysThisMonth(BIRTHDAYS, '2026-11-25')).toEqual([]);
  });
});

describe('isBirthdayToday', () => {
  it('compares month and day only', () => {
    expect(isBirthdayToday('1995-11-07', '2026-11-07')).toBe(true);
    expect(isBirthdayToday('1995-11-08', '2026-11-07')).toBe(false);
  });
});

describe('ageTurning', () => {
  it('is the age reached in the given year', () => {
    expect(ageTurning('1990-11-20', 2026)).toBe(36);
  });

  it('hides implausible ages from bad imported dates', () => {
    expect(ageTurning('1800-01-01', 2026)).toBeNull();
    expect(ageTurning('2026-03-01', 2026)).toBeNull();
  });
});

describe('birthdayAgeLabel', () => {
  it('speaks of the coming birthday in the future and of a past one in the past', () => {
    expect(birthdayAgeLabel('1990-11-20', 2026, '2026-11-07')).toBe('Completa 36 anos');
    expect(birthdayAgeLabel('1990-11-07', 2026, '2026-11-07')).toBe('Completa 36 anos');
    expect(birthdayAgeLabel('1990-03-02', 2026, '2026-11-07')).toBe('Completou 36 anos');
  });

  it('counts the age in the year being viewed', () => {
    expect(birthdayAgeLabel('1990-03-02', 2027, '2026-11-07')).toBe('Completa 37 anos');
    expect(birthdayAgeLabel('1990-12-02', 2025, '2026-11-07')).toBe('Completou 35 anos');
  });

  it('is empty when the age is implausible', () => {
    expect(birthdayAgeLabel('1800-03-02', 2026, '2026-11-07')).toBeNull();
  });
});

describe('birthdaysListText', () => {
  it('lists date, name and phone under a heading, with a blank line between people', () => {
    const list = [birthday('Ana', '1985-11-03', '11988887777'), birthday('Davi', '1995-11-07')];
    const text = birthdaysListText(list, 2026, 'novembro', (phone) => `+${phone}`);
    expect(text).toBe(
      ['Aniversariantes de novembro de 2026', '03/11 · Ana · +11988887777', '07/11 · Davi · sem celular'].join('\n\n'),
    );
  });
});

describe('shiftMonth', () => {
  it('wraps from December to January and back', () => {
    expect(shiftMonth(12, 1)).toBe(1);
    expect(shiftMonth(1, -1)).toBe(12);
    expect(shiftMonth(6, 1)).toBe(7);
    expect(shiftMonth(6, -1)).toBe(5);
  });
});
