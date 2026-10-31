// React
import { useCallback, useEffect, useState } from 'react';
// Local
import { supabase } from '../../../lib/supabase';
import { MembershipStatus } from '../../../domain/memberRecords';
import { EntryType } from '../../../types/church';

export interface MemberRow {
  id: string;
  name: string;
  entry_type: EntryType | null;
  membership_status: MembershipStatus;
}

export function useMembers() {
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: loadError } = await supabase
      .from('people')
      .select('id, name, entry_type, membership_status')
      .eq('status', 'member')
      .order('name', { ascending: true });

    if (loadError) setError(loadError.message);
    else setMembers((data ?? []) as MemberRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { members, loading, error };
}
