// Local
import { canMarkCoffeeAttendance, currentCoffeeAttendance, selectOpenCoffeeEvents, selectOrphanPeople } from './cafeSchedule';

vi.mock('../lib/supabase', () => ({ supabase: {} }));

const past = { id: 'past', event_date: '2026-09-13' };
const today = { id: 'today', event_date: '2026-09-23' };
const future = { id: 'future', event_date: '2026-09-27' };

describe('selectOpenCoffeeEvents', () => {
  it('closes a past café once its queue is empty', () => {
    expect(selectOpenCoffeeEvents([past, future], { future: 2 }, '2026-09-23')).toEqual([future]);
  });

  it('keeps a past café open while anyone is still waiting on it', () => {
    expect(selectOpenCoffeeEvents([past, future], { past: 1 }, '2026-09-23')).toEqual([past, future]);
  });

  it("keeps today's café open even with nobody in it yet", () => {
    expect(selectOpenCoffeeEvents([today], {}, '2026-09-23')).toEqual([today]);
  });

  it('closes every past café at once when they all emptied out', () => {
    expect(selectOpenCoffeeEvents([past, today], {}, '2026-09-27')).toEqual([]);
  });
});

describe('currentCoffeeAttendance', () => {
  const row = (person_id: string, event_date: string) => ({ person_id, coffee_event: { event_date } });

  it('keeps only the latest café for someone who came back for a second one', () => {
    expect(currentCoffeeAttendance([row('raissa', '2026-09-13'), row('raissa', '2026-11-08')])).toEqual([
      row('raissa', '2026-11-08'),
    ]);
  });

  it('leaves people with a single café alone', () => {
    const rows = [row('a', '2026-09-13'), row('b', '2026-11-08')];
    expect(currentCoffeeAttendance(rows)).toEqual(rows);
  });

  it('does not reopen a past café through someone now queued for a newer one', () => {
    const current = currentCoffeeAttendance([
      { ...row('raissa', '2026-09-13'), coffee_event_id: 'past' },
      { ...row('raissa', '2026-11-08'), coffee_event_id: 'next' },
    ]);
    expect(current.map((r) => r.coffee_event_id)).toEqual(['next']);
  });
});

describe('canMarkCoffeeAttendance', () => {
  it('blocks attendance before the café day', () => {
    expect(canMarkCoffeeAttendance('2026-11-08', '2026-10-30')).toBe(false);
  });

  it('allows it from the café day on', () => {
    expect(canMarkCoffeeAttendance('2026-11-08', '2026-11-08')).toBe(true);
    expect(canMarkCoffeeAttendance('2026-11-08', '2026-11-09')).toBe(true);
  });
});

describe('selectOrphanPeople', () => {
  it('treats someone with only past cafés attended as needing a seat', () => {
    expect(
      selectOrphanPeople([{ id: 'raissa', status: 'welcome_coffee' }], [{ person_id: 'raissa', attended: true }]),
    ).toEqual(['raissa']);
  });

  it('leaves someone who already has an open seat alone', () => {
    expect(
      selectOrphanPeople([{ id: 'raissa', status: 'welcome_coffee' }], [{ person_id: 'raissa', attended: false }]),
    ).toEqual([]);
  });
});
