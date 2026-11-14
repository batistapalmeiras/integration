// Local
import { FamilyRelation, FamilyTraits, isFamilyRelation, relationRank } from '../domain/family';
import { Gender } from '../domain/memberRecords';
import { byName } from '../domain/text';
import { supabase } from '../lib/supabase';

export interface Relative {
  id: string;
  name: string;
  relation: FamilyRelation;
  gender: Gender | null;
  derived: boolean;
}

export interface FamilyLink {
  relativeId: string;
  relation: FamilyRelation;
}

const toGender = (value: string | null): Gender | null => (value === 'male' || value === 'female' ? value : null);

export async function getFamily(personId: string): Promise<Relative[]> {
  const { data, error } = await supabase.rpc('get_family_links', { p_person_id: personId });
  if (error) throw error;

  return data
    .flatMap((row) =>
      isFamilyRelation(row.relation)
        ? [
            {
              id: row.person_id,
              name: row.name,
              relation: row.relation,
              gender: toGender(row.gender),
              derived: row.derived,
            },
          ]
        : [],
    )
    .sort((a, b) => relationRank(a.relation) - relationRank(b.relation) || byName(a, b));
}

export async function setFamily(personId: string, links: FamilyLink[], hidden: string[]): Promise<void> {
  const { error } = await supabase.rpc('set_family_links', {
    p_person_id: personId,
    p_links: links.map((link) => ({ relative_id: link.relativeId, relation: link.relation })),
    p_hidden: hidden,
  });
  if (error) throw error;
}

export async function listFamilyTraits(): Promise<Record<string, FamilyTraits>> {
  const [profiles, links] = await Promise.all([
    supabase.from('member_profiles').select('person_id, gender'),
    supabase
      .from('family_links')
      .select('person_id, relative_id, relation')
      .in('relation', ['spouse', 'father', 'mother']),
  ]);
  if (profiles.error) throw profiles.error;
  if (links.error) throw links.error;

  const traits: Record<string, FamilyTraits> = {};
  const traitsOf = (id: string) => (traits[id] ??= { gender: null, spouseId: null, fatherId: null, motherId: null });
  (profiles.data ?? []).forEach((row) => {
    traitsOf(row.person_id).gender = toGender(row.gender);
  });
  (links.data ?? []).forEach((row) => {
    const entry = traitsOf(row.person_id);
    if (row.relation === 'spouse') entry.spouseId = row.relative_id;
    if (row.relation === 'father') entry.fatherId = row.relative_id;
    if (row.relation === 'mother') entry.motherId = row.relative_id;
  });
  return traits;
}
