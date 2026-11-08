// Local
import { parseDateKey, parseTypedDate, toDateKey } from './dates';

describe('parseTypedDate', () => {
  it('turns a typed dd/mm/aaaa date into a date key', () => {
    expect(parseTypedDate('07/03/1990')).toBe('1990-03-07');
  });

  it('rejects incomplete and impossible dates', () => {
    expect(parseTypedDate('07/03/19')).toBeNull();
    expect(parseTypedDate('31/02/1990')).toBeNull();
    expect(parseTypedDate('00/13/1990')).toBeNull();
  });
});

describe('date keys', () => {
  it('round-trips a local date through its yyyy-mm-dd key', () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(toDateKey(parseDateKey('2026-12-31'))).toBe('2026-12-31');
  });
});
