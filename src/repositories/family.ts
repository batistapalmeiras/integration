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
  const { data, error } = await supabase.rpc('get_family', { p_person_id: personId });
  if (error) throw error;

  const relatives = (relation: string) =>
    data.filter((row) => row.relation === relation).map((row) => ({ id: row.person_id, name: row.name }));

  return {
    spouse: relatives('spouse')[0] ?? null,
    father: relatives('father')[0] ?? null,
    mother: relatives('mother')[0] ?? null,
    children: relatives('child').sort(byName),
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
