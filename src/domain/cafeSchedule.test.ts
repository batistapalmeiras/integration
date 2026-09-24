// Local
import { selectOpenCoffeeEvents } from './cafeSchedule';

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
