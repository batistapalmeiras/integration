// React
import { useEffect, useState } from 'react';
// Libs
import { MultiSelectOption } from 'bp-kit';
// Local
import { supabase } from '../../../lib/supabase';

export interface SmallGroupOption {
  id: string;
  name: string;
  leaders: string[];
}

export function smallGroupLabel(group: SmallGroupOption): string {
  return group.leaders?.length ? `${group.name} — ${group.leaders.join(', ')}` : group.name;
}

export function usePublicGroups() {
  const [ministries, setMinistries] = useState<MultiSelectOption[]>([]);
  const [smallGroups, setSmallGroups] = useState<SmallGroupOption[] | null>(null);

  useEffect(() => {
    supabase
      .rpc('list_ministries')
      .then(({ data }) => setMinistries(((data ?? []) as { name: string }[]).map((m) => ({ value: m.name, label: m.name }))));
    supabase.rpc('list_small_groups').then(({ data, error }) => setSmallGroups(error ? [] : ((data ?? []) as SmallGroupOption[])));
  }, []);

  return { ministries, smallGroups };
}
