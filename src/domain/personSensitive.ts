// Local
import { supabase } from '../lib/supabase';

export interface PersonSensitive {
  attending_since: string | null;
  previous_church: string | null;
  baptism_info: string | null;
  conversion_testimony: string | null;
  marital_status_story: string | null;
  birth_date: string | null;
  origin_church: string | null;
  ministry_interests: string[] | null;
  secret_society: string | null;
  wants_small_group: string | null;
  membership_note: string | null;
}

export async function getPersonSensitive(personId: string): Promise<PersonSensitive | null> {
  const { data, error } = await supabase
    .from('person_sensitive')
    .select('*')
    .eq('person_id', personId)
    .maybeSingle();
  if (error) return null;
  return (data as PersonSensitive | null) ?? null;
}
