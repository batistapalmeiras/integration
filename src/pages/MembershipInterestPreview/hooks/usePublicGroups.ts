// React
import { useEffect, useState } from 'react';
// Libs
import { MultiSelectOption } from 'bp-kit';
// Local
import { listPublicMinistryNames, listPublicSmallGroups, SmallGroupOption } from '../../../repositories/publicForms';

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
    listPublicMinistryNames()
      .then((names) => setMinistries(ministryOptions(names)))
      .catch(() => setMinistries([]));
    listPublicSmallGroups()
      .then(setSmallGroups)
      .catch(() => setSmallGroups([]));
  }, []);

  return { ministries, smallGroups };
}
