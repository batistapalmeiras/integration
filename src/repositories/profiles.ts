// Local
import { supabase } from '../lib/supabase';

export async function getMustChangePassword(userId: string): Promise<boolean> {
  const { data, error } = await supabase.from('profiles').select('must_change_password').eq('id', userId).single();
  if (error) throw error;
  return data?.must_change_password ?? false;
}

export async function clearMustChangePassword(userId: string): Promise<void> {
  const { error } = await supabase.from('profiles').update({ must_change_password: false }).eq('id', userId);
  if (error) throw error;
}
