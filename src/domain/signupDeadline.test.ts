// Local
import { missedSignupIds } from './signupDeadline';

vi.mock('../lib/supabase', () => ({ supabase: {} }));

const cohort = (id: string, firstLesson: string) => ({
  cohort: { id, name: id, status: 'active' },
  lessons: [{ id: `${id}-1`, number: 1, date: firstLesson }],
});

const attendedSeptember = {
  id: 'a',
  person_id: 'geovane',
  coffee_event_id: 'sep',
  attended: true,
  person: null,
  coffee_event: { event_date: '2026-09-13' },
};

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('missedSignupIds', () => {
  const cohorts = [cohort('october', '2026-10-04'), cohort('november', '2026-11-15')];
  const now = new Date('2026-10-31T12:00:00-03:00');

  it('archives someone whose class started after the café they came to', () => {
    vi.setSystemTime(now);
    expect(
      missedSignupIds([{ id: 'geovane', status: 'pending_signup', signup_window_from: null }], [attendedSeptember], cohorts as never),
    ).toEqual(['geovane']);
  });

  it('counts the deadline from the day a returning person accepted, not from the old café', () => {
    vi.setSystemTime(now);
    expect(
      missedSignupIds(
        [{ id: 'geovane', status: 'pending_signup', signup_window_from: '2026-10-31' }],
        [attendedSeptember],
        cohorts as never,
      ),
    ).toEqual([]);
  });
});
