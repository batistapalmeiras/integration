// Local
import {
  answerConsolidation,
  listConsolidationHistory,
  listConsolidationQueue,
  listConsolidationStates,
  redirectConsolidation,
} from '../../src/repositories/consolidations';

const { supabase, rpc } = vi.hoisted(() => {
  const data = {
    queue: [
      { id: 'c1', due_at: '2027-01-12T10:00:00Z', overdue: false, person_id: 'p1' },
      { id: 'c2', due_at: '2026-11-01T10:00:00Z', overdue: true, person_id: 'p2' },
      { id: 'c3', due_at: '2026-11-02T10:00:00Z', overdue: true, person_id: 'p2' },
      { id: 'c4', due_at: null, overdue: false, person_id: 'p3' },
    ],
    open: [
      {
        id: 'c1',
        kind: 'small_group',
        started_at: '2026-11-12T10:00:00Z',
        closed_at: null,
        outcome: null,
        person: { id: 'p1', name: 'Ana Souza' },
        small_group: { id: 'g1', name: 'Central' },
        ministry: null,
      },
      {
        id: 'c2',
        kind: 'ministry',
        started_at: '2026-09-01T10:00:00Z',
        closed_at: null,
        outcome: null,
        person: { id: 'p2', name: 'Bruno Lima' },
        small_group: null,
        ministry: { id: 'm1', name: 'Louvor' },
      },
      {
        id: 'c4',
        kind: 'small_group',
        started_at: '2026-09-01T10:00:00Z',
        closed_at: null,
        outcome: null,
        person: { id: 'p3', name: 'Carla Dias' },
        small_group: { id: 'g1', name: 'Central' },
        ministry: null,
      },
    ],
    closed: [
      {
        id: 'c5',
        kind: 'small_group',
        started_at: '2026-06-01T10:00:00Z',
        closed_at: '2026-08-05T10:00:00Z',
        outcome: 'consolidated',
        person: { id: 'p1', name: 'Ana Souza' },
        small_group: { id: 'g1', name: 'Central' },
        ministry: null,
      },
      {
        id: 'c6',
        kind: 'small_group',
        started_at: '2026-06-01T10:00:00Z',
        closed_at: '2026-08-05T10:00:00Z',
        outcome: 'unknown',
        person: { id: 'p2', name: 'Bruno Lima' },
        small_group: { id: 'g1', name: 'Central' },
        ministry: null,
      },
    ],
  };
  const result = (rows: unknown[]) => Promise.resolve({ data: rows, error: null });
  const rpc = vi.fn((): Promise<{ error: Error | null }> => Promise.resolve({ error: null }));
  return {
    rpc,
    supabase: {
      rpc,
      from: (table: string) => ({
        select: () =>
          table === 'consolidation_queue'
            ? result(data.queue)
            : { is: () => result(data.open), not: () => ({ order: () => result(data.closed) }) },
      }),
    },
  };
});

vi.mock('../../src/lib/supabase', () => ({ supabase }));

describe('listConsolidationQueue', () => {
  it('joins each open consolidation with its due date and group', async () => {
    const queue = await listConsolidationQueue();

    expect(queue).toEqual([
      {
        id: 'c1',
        personId: 'p1',
        personName: 'Ana Souza',
        kind: 'small_group',
        groupId: 'g1',
        groupName: 'Central',
        startedAt: '2026-11-12T10:00:00Z',
        dueAt: '2027-01-12T10:00:00Z',
        overdue: false,
      },
      {
        id: 'c2',
        personId: 'p2',
        personName: 'Bruno Lima',
        kind: 'ministry',
        groupId: 'm1',
        groupName: 'Louvor',
        startedAt: '2026-09-01T10:00:00Z',
        dueAt: '2026-11-01T10:00:00Z',
        overdue: true,
      },
    ]);
  });
});

describe('listConsolidationHistory', () => {
  it('lists the answered ones and skips an unknown outcome', async () => {
    const history = await listConsolidationHistory();

    expect(history).toEqual([
      {
        id: 'c5',
        personId: 'p1',
        personName: 'Ana Souza',
        kind: 'small_group',
        groupName: 'Central',
        startedAt: '2026-06-01T10:00:00Z',
        closedAt: '2026-08-05T10:00:00Z',
        outcome: 'consolidated',
      },
    ]);
  });
});

describe('listConsolidationStates', () => {
  it('marks each person, and an overdue one wins over an in progress one', async () => {
    expect(await listConsolidationStates()).toEqual({ p1: 'in_progress', p2: 'overdue', p3: 'in_progress' });
  });
});

describe('answering a consolidation', () => {
  beforeEach(() => rpc.mockClear());

  it('sends the answer to the database', async () => {
    await answerConsolidation('c1', 'not_consolidated');

    expect(rpc).toHaveBeenCalledWith('close_consolidation', { p_consolidation_id: 'c1', p_outcome: 'not_consolidated' });
  });

  it('sends the new group when redirecting', async () => {
    await redirectConsolidation('c1', 'ministry', 'm2');

    expect(rpc).toHaveBeenCalledWith('redirect_consolidation', {
      p_consolidation_id: 'c1',
      p_to_kind: 'ministry',
      p_to_id: 'm2',
    });
  });

  it('throws what the database refuses', async () => {
    rpc.mockResolvedValueOnce({ error: new Error('Esta consolidação já foi respondida.') });

    await expect(answerConsolidation('c1', 'consolidated')).rejects.toThrow('Esta consolidação já foi respondida.');
  });
});
