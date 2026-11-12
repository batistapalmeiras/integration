// Local
import { listCouncils } from '../../src/repositories/councils';

const { orders, supabase } = vi.hoisted(() => {
  const orders: string[] = [];
  const builder = {
    select: () => builder,
    order: (column: string, options: { ascending: boolean }) => {
      orders.push(`${column} ${options.ascending ? 'asc' : 'desc'}`);
      return Promise.resolve({
        data: [
          { id: 'c2', meeting_date: '2026-11-10', people: [{ count: 3 }] },
          { id: 'c1', meeting_date: '2026-10-27', people: [{ count: 5 }] },
        ],
        error: null,
      });
    },
  };
  return { orders, supabase: { from: () => builder } };
});

vi.mock('../../src/lib/supabase', () => ({ supabase }));

describe('listCouncils', () => {
  it('asks for the newest meeting first, for every screen that lists councils', async () => {
    const councils = await listCouncils();

    expect(orders).toEqual(['meeting_date desc']);
    expect(councils).toEqual([
      { id: 'c2', meetingDate: '2026-11-10', memberCount: 3 },
      { id: 'c1', meetingDate: '2026-10-27', memberCount: 5 },
    ]);
  });
});
