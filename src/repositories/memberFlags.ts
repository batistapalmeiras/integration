// Local
import { isMemberFlag, MemberFlag } from '../domain/memberFlags';
import { supabase } from '../lib/supabase';

export async function addMemberFlags(personId: string, flags: MemberFlag[]): Promise<void> {
  if (flags.length === 0) return;
  const { error } = await supabase.from('member_flags').upsert(
    flags.map((flag) => ({ person_id: personId, flag })),
    { onConflict: 'person_id,flag', ignoreDuplicates: true },
  );
  if (error) throw error;
}

export async function removeMemberFlags(personId: string, flags: MemberFlag[]): Promise<void> {
  if (flags.length === 0) return;
  const { error } = await supabase.from('member_flags').delete().eq('person_id', personId).in('flag', flags);
  if (error) throw error;
}

export async function listMemberFlags(personId: string): Promise<MemberFlag[]> {
  const { data, error } = await supabase.from('member_flags').select('flag').eq('person_id', personId);
  if (error) throw error;
  return data.map((row) => row.flag).filter(isMemberFlag);
}

export async function saveMemberFlags(personId: string, current: MemberFlag[], next: MemberFlag[]): Promise<void> {
  await addMemberFlags(personId, next.filter((flag) => !current.includes(flag)));
  await removeMemberFlags(personId, current.filter((flag) => !next.includes(flag)));
}
