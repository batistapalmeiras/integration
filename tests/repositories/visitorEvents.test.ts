// Local
import { listVisitorEvents } from '../../src/repositories/visitorEvents';

const { supabase } = vi.hoisted(() => ({
  supabase: {
    rpc: () =>
      Promise.resolve({
        data: [
          {
            event: 'record_updated',
            detail: { fields: ['name', 'phone'] },
            created_at: '2026-10-05T13:00:00Z',
            author_name: 'Ana Souza',
          },
          {
            event: 'lesson_attended',
            detail: { lesson: 2, cohort: 'Turma 15/11/2026' },
            created_at: '2026-10-20T13:00:00Z',
            author_name: null,
          },
        ],
        error: null,
      }),
  },
}));

vi.mock('../../src/lib/supabase', () => ({ supabase }));

describe('listVisitorEvents', () => {
  it('reads the detail of each event into plain fields', async () => {
    const events = await listVisitorEvents('p1');

    expect(events[0]).toMatchObject({ event: 'record_updated', fields: ['name', 'phone'], lesson: null });
    expect(events[1]).toMatchObject({ event: 'lesson_attended', lesson: 2, cohort: 'Turma 15/11/2026', fields: [] });
  });
});
