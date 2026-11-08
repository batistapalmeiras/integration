// Libs
import { parseDateKey, toDateKey } from 'bp-kit';
// Local
import { isFutureDate, todayKey } from '../../src/domain/dates';

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
