// Local
import { listMemberRows } from '../../src/repositories/memberRecords';

const rows: Record<string, unknown[]> = {
  people: [
    {
      id: 'p1',
      name: 'Ana Souza',
      phone: '31999990000',
      entry_type: null,
      membership_status: 'active',
      member_profiles: { photo_updated_at: null, photo_folder: null, gender: 'female', marital_status: 'married' },
      member_flags: [{ flag: 'absent' }],
      person_sensitive: { birth_date: '1990-05-01' },
      person_small_groups: [{ small_group_id: 'g1' }],
      person_ministries: [],
    },
    {
      id: 'p2',
      name: 'Bruno Lima',
      phone: null,
      entry_type: null,
      membership_status: 'active',
      member_profiles: null,
      member_flags: [],
      person_sensitive: null,
      person_small_groups: [],
      person_ministries: [{ ministry_id: 'm1' }],
    },
  ],
  consolidation_queue: [
    { person_id: 'p2', overdue: false },
    { person_id: 'p2', overdue: true },
  ],
};

const { supabase } = vi.hoisted(() => {
  const result = (table: string) => Promise.resolve({ data: rows[table], error: null });
  return {
    supabase: {
      from: (table: string) => ({
        select: () => (table === 'consolidation_queue' ? result(table) : { eq: () => ({ order: () => result(table) }) }),
      }),
    },
  };
});

vi.mock('../../src/lib/supabase', () => ({ supabase }));

describe('listMemberRows', () => {
  it('reads each member with the data the filters need, even when the profile is missing', async () => {
    const members = await listMemberRows();

    expect(members[0]).toMatchObject({
      id: 'p1',
      gender: 'female',
      maritalStatus: 'married',
      birthDate: '1990-05-01',
      flags: ['absent'],
      consolidation: null,
      inSmallGroup: true,
      inMinistry: false,
    });
    expect(members[1]).toMatchObject({
      id: 'p2',
      gender: null,
      maritalStatus: null,
      birthDate: null,
      flags: [],
      consolidation: 'overdue',
      inSmallGroup: false,
      inMinistry: true,
    });
  });
});
