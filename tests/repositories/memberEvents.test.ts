// Local
import { listMemberEvents } from '../../src/repositories/memberEvents';

const { supabase } = vi.hoisted(() => ({
  supabase: {
    rpc: () =>
      Promise.resolve({
        data: [
          {
            event: 'record_updated',
            detail: { fields: ['cpf', 'address_zip'] },
            created_at: '2026-11-12T10:00:00Z',
            author_name: 'Pastor Silva',
          },
          {
            event: 'small_group_joined',
            detail: { name: 'PG Centro' },
            created_at: '2026-11-12T10:05:00Z',
            author_name: null,
          },
        ],
        error: null,
      }),
  },
}));

vi.mock('../../src/lib/supabase', () => ({ supabase }));

describe('listMemberEvents', () => {
  it('reads the detail of each event into plain fields', async () => {
    const events = await listMemberEvents('p1');

    expect(events[0]).toMatchObject({ event: 'record_updated', fields: ['cpf', 'address_zip'], authorName: 'Pastor Silva' });
    expect(events[1]).toMatchObject({ event: 'small_group_joined', name: 'PG Centro', fields: [], authorName: null });
  });
});
