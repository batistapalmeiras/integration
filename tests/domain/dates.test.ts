// Libs
import { parseDateKey, toDateKey } from 'bp-kit';
// Local
import { isFutureDate, monthsBefore, todayKey } from '../../src/domain/dates';

describe('date keys', () => {
  it('round-trips a local date through its yyyy-mm-dd key', () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(toDateKey(parseDateKey('2026-12-31') ?? new Date(0))).toBe('2026-12-31');
  });
});

describe('isFutureDate', () => {
  it('blocks only days after today', () => {
    const today = parseDateKey(todayKey()) ?? new Date();
    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    expect(isFutureDate(today)).toBe(false);
    expect(isFutureDate(new Date(1990, 2, 15))).toBe(false);
    expect(isFutureDate(tomorrow)).toBe(true);
  });
});

describe('monthsBefore', () => {
  it('goes back whole months, across the year', () => {
    expect(monthsBefore('2026-11-20', 3)).toBe('2026-08-20');
    expect(monthsBefore('2026-02-10', 3)).toBe('2025-11-10');
  });

  it('stops at the last day of a shorter month', () => {
    expect(monthsBefore('2026-05-31', 3)).toBe('2026-02-28');
  });
});
