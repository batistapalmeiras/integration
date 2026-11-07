// Local
import { MemberBirthday } from '../domain/birthdays';
import { COUNTED_MEMBERSHIP_STATUSES } from '../domain/memberRecords';
import { getPersonSensitive } from '../domain/personSensitive';
import { useQuery } from '../lib/queryCache';
import { queryKeys } from '../lib/queryKeys';
import { supabase } from '../lib/supabase';

interface BirthdayRow {
  birth_date: string;
  people: { id: string; name: string; phone: string | null };
}

async function listMemberBirthdays(): Promise<MemberBirthday[]> {
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

export const usePersonSensitive = (personId: string, enabled = true) =>
  useQuery(queryKeys.personSensitive(personId), () => getPersonSensitive(personId), { enabled: enabled && !!personId });

export const useMemberBirthdays = () => useQuery(queryKeys.memberBirthdays, listMemberBirthdays);
