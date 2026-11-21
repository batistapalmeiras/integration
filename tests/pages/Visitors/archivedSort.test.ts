// Local
import { Person } from '../../../src/features/visitors';
import { sortArchived } from '../../../src/pages/Visitors/archivedSort';

const person = (id: string, name: string): Person => ({
  id,
  name,
  phone: null,
  age: null,
  email: null,
  status: 'archived',
  whatsapp_opened_at: null,
  class_invite_sent_at: null,
  signup_window_from: null,
  membership_interest_sent_at: null,
  entry_type: null,
  coffee_retry_used: false,
  origin: 'integration',
  membership_status: null,
  visited_on: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
});

describe('sortArchived', () => {
  const ana = person('a', 'Ana');
  const bia = person('b', 'Bia');
  const caio = person('c', 'Caio');
  const dates = { a: '2026-03-01T10:00:00Z', b: '2026-11-20T10:00:00Z', c: '2026-07-15T10:00:00Z' };

  it('puts the most recently archived first', () => {
    expect(sortArchived([ana, bia, caio], dates, 'archived_desc').map((p) => p.name)).toEqual(['Bia', 'Caio', 'Ana']);
  });

  it('puts the ones archived longest ago first', () => {
    expect(sortArchived([ana, bia, caio], dates, 'archived_asc').map((p) => p.name)).toEqual(['Ana', 'Caio', 'Bia']);
  });

  it('keeps the name order', () => {
    expect(sortArchived([ana, bia, caio], dates, 'name').map((p) => p.name)).toEqual(['Ana', 'Bia', 'Caio']);
  });
});
