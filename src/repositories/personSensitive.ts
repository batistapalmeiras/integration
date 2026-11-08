// Local
import { PersonSensitive } from '../domain/personSensitive';
import { supabase } from '../lib/supabase';

export async function getPersonSensitive(personId: string): Promise<PersonSensitive | null> {
  const { data, error } = await supabase.from('person_sensitive').select('*').eq('person_id', personId).maybeSingle();
  if (error) throw error;
  return (data as PersonSensitive | null) ?? null;
}
