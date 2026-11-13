// Local
import { getFamily, setFamily } from '../../src/repositories/family';

const { calls, supabase } = vi.hoisted(() => {
  const calls: { fn: string; args: unknown }[] = [];
  return {
    calls,
    supabase: {
      rpc: (fn: string, args: unknown) => {
        calls.push({ fn, args });
        return Promise.resolve({
          data: [
            { relation: 'mother', person_id: 'p1', name: 'Ana' },
            { relation: 'son', person_id: 'c1', name: 'Zeca' },
            { relation: 'spouse', person_id: 's1', name: 'Maria' },
            { relation: 'unknown', person_id: 'x1', name: 'Fora' },
          ],
          error: null,
        });
      },
    },
  };
});

vi.mock('../../src/lib/supabase', () => ({ supabase }));

describe('family repository', () => {
  beforeEach(() => calls.splice(0));

  it('lists the spouse and children first, then the rest of the family, and leaves out kinds it does not know', async () => {
    const family = await getFamily('me');

    expect(family.map((relative) => relative.name)).toEqual(['Maria', 'Zeca', 'Ana']);
    expect(family[1].relation).toBe('son');
  });

  it('saves every link of the person in one call', async () => {
    await setFamily('me', [{ relativeId: 'c1', relation: 'son' }]);

    expect(calls).toEqual([
      { fn: 'set_family_links', args: { p_person_id: 'me', p_links: [{ relative_id: 'c1', relation: 'son' }] } },
    ]);
  });
});
