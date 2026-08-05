// React
import { useCallback, useEffect, useState } from 'react';
// Libs
import { useAuthCtx } from 'bp-kit';
// Local
import { supabase } from '../../../lib/supabase';
import { PersonStatus } from '../../../types/person';
import { ActiveCohortInfo, PendingMember, StatusCounts } from '../types';

export function useAdmin() {
  const { user } = useAuthCtx();
  const [counts, setCounts] = useState<StatusCounts>({});
  const [cohort, setCohort] = useState<ActiveCohortInfo | null>(null);
  const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data: peopleData, error: peopleError } = await supabase.from('people').select('status');
    if (peopleError) {
      setError(peopleError.message);
      setLoading(false);
      return;
    }
    const nextCounts: StatusCounts = {};
    for (const row of peopleData ?? []) {
      const status = row.status as PersonStatus;
      nextCounts[status] = (nextCounts[status] ?? 0) + 1;
    }
    setCounts(nextCounts);

    const { data: cohortData } = await supabase.from('cohorts').select('id,name').eq('status', 'active').maybeSingle();
    setCohort((cohortData as ActiveCohortInfo | null) ?? null);

    const { data: pendingData, error: pendingError } = await supabase
      .from('people')
      .select('id,name')
      .eq('status', 'membership_pending');
    if (pendingError) {
      setError(pendingError.message);
      setLoading(false);
      return;
    }
    setPendingMembers((pendingData ?? []) as PendingMember[]);

    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const closeCohort = async () => {
    if (!cohort) return;
    const { error: closeError } = await supabase.from('cohorts').update({ status: 'closed' }).eq('id', cohort.id);
    if (closeError) throw closeError;
    await load();
  };

  const confirmMember = async (person: PendingMember) => {
    const { error: updateError } = await supabase
      .from('people')
      .update({ status: 'member', updated_at: new Date().toISOString() })
      .eq('id', person.id);
    if (updateError) throw updateError;

    await supabase.from('status_history').insert({
      person_id: person.id,
      from_status: 'membership_pending',
      to_status: 'member',
      changed_by: user?.id,
    });

    await load();
  };

  return { counts, cohort, pendingMembers, loading, error, closeCohort, confirmMember };
}
