// Local
import { listMembers } from '../../src/repositories/communityGroups';

const { calls, supabase } = vi.hoisted(() => {
  const calls: string[] = [];
  const builder = {
    select: () => builder,
    eq: (column: string, value: string) => {
      calls.push(`eq ${column}=${value}`);
      return builder;
    },
    in: (column: string, values: string[]) => {
      calls.push(`in ${column}=${values.join(',')}`);
      return builder;
    },
    order: () => Promise.resolve({ data: [{ id: 'p1', name: 'Ana', status: 'member' }], error: null }),
  };
  return { calls, supabase: { from: () => builder } };
});

vi.mock('../../src/lib/supabase', () => ({ supabase }));

describe('listMembers', () => {
  beforeEach(() => calls.splice(0));

  it('lists only active members when picking people for a small group or ministry', async () => {
    const members = await listMembers({ activeOnly: true });

    expect(members).toEqual([{ id: 'p1', name: 'Ana', isMember: true }]);
    expect(calls).toEqual(['eq status=member', 'in membership_status=active']);
  });

  it('lists every member otherwise, as the family picker needs', async () => {
    await listMembers();

    expect(calls).toEqual(['eq status=member']);
  });
});
