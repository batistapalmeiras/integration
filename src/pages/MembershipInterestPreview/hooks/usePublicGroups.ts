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

const SMALL_GROUP_MINISTRIES = ['Anfitrião de PG', 'Líder de PG'];
const SMALL_GROUP_MINISTRY_OPTION = 'Pequenos Grupos – Anfitrião ou Líder';

function ministryOptions(names: string[]): MultiSelectOption[] {
  const others = names.filter((name) => !SMALL_GROUP_MINISTRIES.includes(name));
  const sorted = others.sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const merged = others.length < names.length ? [SMALL_GROUP_MINISTRY_OPTION, ...sorted] : sorted;
  return merged.map((name) => ({ value: name, label: name }));
}

export function usePublicGroups() {
  const [ministries, setMinistries] = useState<MultiSelectOption[]>([]);
  const [smallGroups, setSmallGroups] = useState<SmallGroupOption[] | null>(null);

  useEffect(() => {
    supabase
      .rpc('list_ministries')
      .then(({ data }) => setMinistries(ministryOptions(((data ?? []) as { name: string }[]).map((m) => m.name))));
    supabase.rpc('list_small_groups').then(({ data, error }) => setSmallGroups(error ? [] : ((data ?? []) as SmallGroupOption[])));
  }, []);

  return { ministries, smallGroups };
}
