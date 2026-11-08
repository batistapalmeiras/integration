// Local
import { supabase } from '../lib/supabase';

export async function countActiveVolunteers(): Promise<number> {
  const { count, error } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('active', true);
  if (error) throw error;
  return count ?? 0;
}
