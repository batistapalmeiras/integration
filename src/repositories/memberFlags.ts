// Local
import { MemberFlag } from '../domain/memberFlags';
import { supabase } from '../lib/supabase';

export async function saveMemberFlags(personId: string, current: MemberFlag[], next: MemberFlag[]): Promise<void> {
  const added = next.filter((flag) => !current.includes(flag));
  const removed = current.filter((flag) => !next.includes(flag));

  if (added.length > 0) {
    const { error } = await supabase
      .from('member_flags')
      .insert(added.map((flag) => ({ person_id: personId, flag })));
    if (error) throw error;
  }
  if (removed.length > 0) {
    const { error } = await supabase.from('member_flags').delete().eq('person_id', personId).in('flag', removed);
    if (error) throw error;
  }
}
