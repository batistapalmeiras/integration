// Local
import { isSignupDeadlinePast, selectMissedSignups } from './signupDeadline';

vi.mock('../lib/supabase', () => ({ supabase: {} }));

describe('isSignupDeadlinePast', () => {
  it('is still open earlier on the day of the first class', () => {
    expect(isSignupDeadlinePast('2026-09-23', new Date('2026-09-23T17:29:00'))).toBe(false);
  });

  it('closes exactly when the first class starts', () => {
    expect(isSignupDeadlinePast('2026-09-23', new Date('2026-09-23T17:30:00'))).toBe(true);
  });

  it('is past on any later day', () => {
    expect(isSignupDeadlinePast('2026-09-23', new Date('2026-09-24T08:00:00'))).toBe(true);
  });
});

describe('selectMissedSignups', () => {
  it('archives whoever came to a café held before the first class', () => {
    expect(
      selectMissedSignups([{ personId: 'a', coffeeDate: '2026-09-13' }], '2026-09-23'),
    ).toEqual(['a']);
  });

  it('spares someone whose café happened after the first class — they belong to the next turma', () => {
    expect(
      selectMissedSignups([{ personId: 'a', coffeeDate: '2026-09-27' }], '2026-09-23'),
    ).toEqual([]);
  });

  it('spares someone who came to a café on the very day of the first class', () => {
    expect(
      selectMissedSignups([{ personId: 'a', coffeeDate: '2026-09-23' }], '2026-09-23'),
    ).toEqual([]);
  });

  it('archives a person with no café attendance to place them in either cycle', () => {
    expect(selectMissedSignups([{ personId: 'a', coffeeDate: null }], '2026-09-23')).toEqual(['a']);
  });
});
