// Local
import { supabase } from '../lib/supabase';
import { PersonStatus } from '../types/person';

export function fromIntegration<Query extends { is(column: string, value: null): Query }>(query: Query): Query {
  return query.is('legacy_id', null);
}

export async function countIntegrationPeopleByStatus(): Promise<Partial<Record<PersonStatus, number>>> {
  const { data, error } = await fromIntegration(supabase.from('people').select('status'));
  if (error) throw error;
  const counts: Partial<Record<PersonStatus, number>> = {};
  for (const row of (data ?? []) as { status: PersonStatus }[]) {
    counts[row.status] = (counts[row.status] ?? 0) + 1;
  }
  return counts;
}
