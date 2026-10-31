// Local
import {
  canMarkCoffeeAttendance,
  coffeeHistory,
  coffeePresence,
  countQueuedFrom,
  currentCoffeeAttendance,
  selectOpenCoffeeEvents,
  selectOrphanPeople,
  upcomingCoffeeEvent,
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
      selectOrphanPeople([{ id: 'raissa', status: 'welcome_coffee', signup_window_from: null }], [{ person_id: 'raissa', attended: true }]),
    ).toEqual(['raissa']);
  });

  it('leaves someone who already has an open seat alone', () => {
    expect(
      selectOrphanPeople([{ id: 'raissa', status: 'welcome_coffee', signup_window_from: null }], [{ person_id: 'raissa', attended: false }]),
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

describe('upcomingCoffeeEvent', () => {
  const events = [
    { id: 'a', event_date: '2026-10-25' },
    { id: 'b', event_date: '2026-11-08' },
    { id: 'c', event_date: '2026-11-22' },
  ];

  it('picks the first café from today on, today included', () => {
    expect(upcomingCoffeeEvent(events, '2026-11-08')?.id).toBe('b');
    expect(upcomingCoffeeEvent(events, '2026-11-01')?.id).toBe('b');
  });

  it('returns null when every café is in the past', () => {
    expect(upcomingCoffeeEvent(events, '2026-12-01')).toBeNull();
  });
});

describe('coffeeHistory', () => {
  const row = (id: string, personId: string, eventId: string, eventDate: string, attended: boolean, status: string) => ({
    id,
    person_id: personId,
    coffee_event_id: eventId,
    attended,
    person: { id: personId, name: personId, phone: '', status, class_invite_sent_at: null },
    coffee_event: { event_date: eventDate },
  });

  it('lists cafés newest first, with who came, who missed and who is still enrolled', () => {
    const history = coffeeHistory({
      events: [
        { id: 'sep', event_date: '2026-09-13', event_time: '17:30:00' },
        { id: 'nov', event_date: '2026-11-08', event_time: '17:30:00' },
      ],
      attendance: [
        row('1', 'Ana', 'sep', '2026-09-13', true, 'integration'),
        row('2', 'Bia', 'sep', '2026-09-13', false, 'welcome_coffee'),
        row('3', 'Bia', 'nov', '2026-11-08', false, 'welcome_coffee'),
      ],
    }, '2026-10-31');

    expect(history.map((event) => event.id)).toEqual(['nov', 'sep']);
    expect(history[1].people).toEqual([
      { personId: 'Ana', name: 'Ana', presence: 'came' },
      { personId: 'Bia', name: 'Bia', presence: 'missed' },
    ]);
    expect(history[0].people).toEqual([{ personId: 'Bia', name: 'Bia', presence: 'enrolled' }]);
  });

  it('tells an archived person apart from a past café nobody marked', () => {
    const history = coffeeHistory({
      events: [{ id: 'oct', event_date: '2026-10-04', event_time: '17:30:00' }],
      attendance: [
        row('1', 'Iuri', 'oct', '2026-10-04', false, 'archived'),
        row('2', 'Lia', 'oct', '2026-10-04', false, 'welcome_coffee'),
      ],
    }, '2026-10-31');

    expect(history[0].people.map((person) => person.presence)).toEqual(['archived', 'unmarked']);
  });
});

describe('countQueuedFrom', () => {
  const seat = (personId: string, status: string, signupWindowFrom: string | null) => ({
    id: personId,
    person_id: personId,
    coffee_event_id: 'sep',
    attended: true,
    person: { id: personId, name: personId, phone: '', status, class_invite_sent_at: null, signup_window_from: signupWindowFrom },
    coffee_event: { event_date: '2026-09-13' },
  });

  it('keeps a café open for whoever still waits on it, but not for someone who came back later', () => {
    expect(countQueuedFrom([seat('ana', 'pending_signup', null), seat('geovane', 'pending_signup', '2026-10-31')])).toEqual({
      sep: 1,
    });
  });
});

describe('coffeeHistory for the café still to come', () => {
  const row = (personId: string, eventId: string, eventDate: string, attended: boolean, status: string, signupWindowFrom: string | null = null) => ({
    id: personId + eventId,
    person_id: personId,
    coffee_event_id: eventId,
    attended,
    person: { id: personId, name: personId, phone: '', status, class_invite_sent_at: null, signup_window_from: signupWindowFrom },
    coffee_event: { event_date: eventDate },
  });

  it('shows who is enrolled, who still awaits contact and whoever came back with the invite already sent', () => {
    const [nov] = coffeeHistory(
      {
        events: [
          { id: 'sep', event_date: '2026-09-13', event_time: '17:30:00' },
          { id: 'nov', event_date: '2026-11-08', event_time: '17:30:00' },
        ],
        attendance: [
          row('Bruna', 'nov', '2026-11-08', false, 'welcome_coffee'),
          row('Liese', 'nov', '2026-11-08', false, 'retry_contact'),
          row('Geovane', 'sep', '2026-09-13', true, 'pending_signup', '2026-10-31'),
        ],
      },
      '2026-10-31',
    );

    expect(nov.people).toEqual([
      { personId: 'Bruna', name: 'Bruna', presence: 'enrolled' },
      { personId: 'Geovane', name: 'Geovane', presence: 'invited' },
      { personId: 'Liese', name: 'Liese', presence: 'awaiting_contact' },
    ]);
  });
});
