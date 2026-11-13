// Local
import { FamilyRelation, isFamilyRelation, relationRank } from '../domain/family';
import { byName } from '../domain/text';
import { supabase } from '../lib/supabase';

export interface Relative {
  id: string;
  name: string;
  relation: FamilyRelation;
}

export interface FamilyLink {
  relativeId: string;
  relation: FamilyRelation;
}

export async function getFamily(personId: string): Promise<Relative[]> {
  const { data, error } = await supabase.rpc('get_family_links', { p_person_id: personId });
  if (error) throw error;

  return data
    .flatMap((row) =>
      isFamilyRelation(row.relation)
        ? [{ id: row.person_id, name: row.name, relation: row.relation }]
        : [],
    )
    .sort((a, b) => relationRank(a.relation) - relationRank(b.relation) || byName(a, b));
}

export async function setFamily(personId: string, links: FamilyLink[]): Promise<void> {
  const { error } = await supabase.rpc('set_family_links', {
    p_person_id: personId,
    p_links: links.map((link) => ({ relative_id: link.relativeId, relation: link.relation })),
  });
  if (error) throw error;
}
