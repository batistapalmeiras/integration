// Local
import { fetchPersonWithProfile } from '../../src/repositories/people';

const { supabase } = vi.hoisted(() => {
  const builder = {
    select: () => builder,
    eq: () => builder,
    single: () =>
      Promise.resolve({
        data: null,
        error: { code: 'PGRST116', message: 'Cannot coerce the result to a single JSON object' },
      }),
  };
  return { supabase: { from: () => builder } };
});

vi.mock('../../src/lib/supabase', () => ({ supabase }));

describe('fetchPersonWithProfile', () => {
  it('explains in plain words that the person no longer exists', async () => {
    await expect(fetchPersonWithProfile('gone')).rejects.toThrow('Este cadastro foi excluído.');
  });
});
