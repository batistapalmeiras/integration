// Local
import { byName } from '../domain/text';
import { supabase } from '../lib/supabase';

export interface Relative {
  id: string;
  name: string;
}

export interface Family {
  spouse: Relative | null;
  father: Relative | null;
  mother: Relative | null;
  children: Relative[];
}

export interface FamilyLinks {
  spouseId: string | null;
  fatherId: string | null;
  motherId: string | null;
  childIds: string[];
}

export async function getFamily(personId: string): Promise<Family> {
  const [spouses, parents, children] = await Promise.all([
    supabase
      .from('spouse_links')
      .select('person_a_id, person_b_id')
      .or(`person_a_id.eq.${personId},person_b_id.eq.${personId}`),
    supabase.from('parent_links').select('parent_id, role').eq('child_id', personId),
    supabase.from('parent_links').select('child_id').eq('parent_id', personId),
  ]);
  const failure = spouses.error ?? parents.error ?? children.error;
  if (failure) throw failure;

  const spouseRow = spouses.data?.[0];
  const spouseId = spouseRow
    ? spouseRow.person_a_id === personId
      ? spouseRow.person_b_id
      : spouseRow.person_a_id
    : null;
  const fatherId = parents.data?.find((row) => row.role === 'father')?.parent_id ?? null;
  const motherId = parents.data?.find((row) => row.role === 'mother')?.parent_id ?? null;
  const childIds = (children.data ?? []).map((row) => row.child_id);

  const ids = [spouseId, fatherId, motherId, ...childIds].filter((id): id is string => !!id);
  const names = new Map<string, string>();
  if (ids.length > 0) {
    const { data, error } = await supabase.from('people').select('id, name').in('id', ids);
    if (error) throw error;
    (data ?? []).forEach((person) => names.set(person.id, person.name));
  }

  const relative = (id: string | null): Relative | null => (id ? { id, name: names.get(id) ?? '' } : null);

  return {
    spouse: relative(spouseId),
    father: relative(fatherId),
    mother: relative(motherId),
    children: childIds.map((id) => ({ id, name: names.get(id) ?? '' })).sort(byName),
  };
}

export async function setFamily(personId: string, links: FamilyLinks): Promise<void> {
  const { error } = await supabase.rpc('set_family', {
    p_person_id: personId,
    p_spouse_id: links.spouseId ?? undefined,
    p_father_id: links.fatherId ?? undefined,
    p_mother_id: links.motherId ?? undefined,
    p_child_ids: links.childIds,
  });
  if (error) throw error;
}
