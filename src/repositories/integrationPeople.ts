// Local
import { PersonStatus } from '../types/person';
import { supabase } from '../lib/supabase';

export function fromIntegration<Query extends { eq(column: string, value: boolean): Query }>(query: Query): Query {
  return query.eq('imported', false);
}

export async function countIntegrationPeopleByStatus(): Promise<Partial<Record<PersonStatus, number>>> {
  const { data, error } = await supabase.rpc('count_integration_people_by_status');
  if (error) throw error;
  const counts: Partial<Record<PersonStatus, number>> = {};
  for (const row of (data ?? []) as { status: PersonStatus; total: number }[]) counts[row.status] = Number(row.total);
  return counts;
}

export async function countIntegrationPeopleCreatedSince(since: Date): Promise<number> {
  const { count, error } = await fromIntegration(
    supabase.from('people').select('id', { count: 'exact', head: true }),
  ).gte('created_at', since.toISOString());
  if (error) throw error;
  return count ?? 0;
}

export async function runPipelineMaintenance(): Promise<void> {
  const { error } = await supabase.rpc('run_pipeline_maintenance');
  if (error) throw error;
}
