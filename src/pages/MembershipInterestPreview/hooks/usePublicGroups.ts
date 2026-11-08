// Libs
import { MultiSelectOption } from 'bp-kit';
// Local
import { usePublicMinistryNames, usePublicSmallGroups } from '../../../queries/public';
import { SmallGroupOption } from '../../../repositories/publicForms';

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
  const ministryNames = usePublicMinistryNames();
  const smallGroups = usePublicSmallGroups();
  return {
    ministries: ministryOptions(ministryNames.data ?? []),
    smallGroups: smallGroups.error ? [] : (smallGroups.data ?? null),
    loadError: !!ministryNames.error || !!smallGroups.error,
  };
}
