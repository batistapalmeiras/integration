// Local
import {
  canMarkCoffeeAttendance,
  coffeePresence,
  currentCoffeeAttendance,
  selectOpenCoffeeEvents,
  selectOrphanPeople,
} from './cafeSchedule';

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

describe('coffeePresence', () => {
  const row = (attended: boolean, status: string, date = '2026-11-08') => ({
    attended,
    person: { status },
    coffee_event: { event_date: date },
  });

  it('reads an attended seat as came', () => {
    expect(coffeePresence(row(true, 'pending_signup'), '2026-11-08')).toEqual({ presence: 'came', editable: true });
  });

  it('reads a seat sent back to retry contact as missed', () => {
    expect(coffeePresence(row(false, 'retry_contact'), '2026-11-08')).toEqual({ presence: 'missed', editable: true });
  });

  it('leaves a seat still waiting on the café unmarked', () => {
    expect(coffeePresence(row(false, 'welcome_coffee'), '2026-11-08')).toEqual({ presence: null, editable: true });
  });

  it('reads an older seat as missed and locks it once the person moved to a later café', () => {
    expect(coffeePresence(row(false, 'welcome_coffee', '2026-11-08'), '2026-11-22')).toEqual({
      presence: 'missed',
      editable: false,
    });
  });

  it('locks the mark once the person moved past the café', () => {
    expect(coffeePresence(row(true, 'integration'), '2026-11-08')).toEqual({ presence: 'came', editable: false });
  });
});
