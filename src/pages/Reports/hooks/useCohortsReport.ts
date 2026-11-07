// Local
import { errorMessage, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { supabase } from '../../../lib/supabase';
import { CohortRow } from '../types';

async function listCohortsReport(): Promise<CohortRow[]> {
  const { data, error } = await supabase
    .from('cohorts')
    .select('*, enrollments(count)')
    .order('created_at', { ascending: false });
  if (error) throw error;

  return (data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    status: c.status,
    createdAt: c.created_at,
    enrollmentCount: (c.enrollments as { count: number }[] | null)?.[0]?.count ?? 0,
  }));
}

export function useCohortsReport() {
  const query = useQuery(queryKeys.cohortsReport, listCohortsReport);
  return { cohorts: query.data ?? [], loading: query.loading, error: errorMessage(query.error) };
}
