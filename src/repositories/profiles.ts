// Libs
import { ProfileSource } from 'bp-kit';
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

export const memberProfileSource: ProfileSource = {
  load: async (client, userId) => {
    const { data, error } = await client
      .rpc('current_profile')
      .maybeSingle<{ id: string; name: string; role: string }>();
    if (error || !data || data.id !== userId) return null;
    return { id: data.id, name: data.name, role: data.role };
  },
  updateIdentity: async (client, name, email) => {
    const { error } = await client.rpc('update_own_identity', { p_name: name, p_email: email });
    return error ? error.message : null;
  },
};
