// Local
import { COUNTED_MEMBERSHIP_STATUSES } from '../domain/memberRecords';
import { MemberBirthday } from '../domain/birthdays';
import { supabase } from '../lib/supabase';

export interface BirthdayRow {
  birth_date: string;
  people: { id: string; name: string; phone: string | null };
}

export async function listMemberBirthdays(): Promise<MemberBirthday[]> {
  const { data, error } = await supabase
    .from('person_sensitive')
    .select('birth_date, people!inner(id, name, phone)')
    .not('birth_date', 'is', null)
    .eq('people.status', 'member')
    .in('people.membership_status', COUNTED_MEMBERSHIP_STATUSES);
  if (error) throw error;
  return ((data ?? []) as unknown as BirthdayRow[]).map((row) => ({
    personId: row.people.id,
    name: row.people.name,
    birthDate: row.birth_date,
    phone: row.people.phone,
  }));
}
