// Local
import { EntryType, toEntryType } from '../types/church';
import {
  MEMBERSHIP_ALERT_LABELS,
  MembershipAlert,
  MembershipAlertCode,
  toMembershipAlertCode,
} from '../domain/membership';
import { byName } from '../domain/text';
import { supabase } from '../lib/supabase';

export async function listMembershipAlerts(personIds: string[]): Promise<MembershipAlert[]> {
  if (personIds.length === 0) return [];
  const { data, error } = await supabase
    .from('membership_alerts')
    .select('person_id, code, answer, resolved')
    .in('person_id', personIds)
    .order('code', { ascending: false });
  if (error) throw error;
  return (data ?? []).flatMap((row) =>
    row.person_id && row.code
      ? [
          {
            person_id: row.person_id,
            code: toMembershipAlertCode(row.code),
            answer: row.answer,
            resolved: !!row.resolved,
          },
        ]
      : [],
  );
}

export async function setMembershipAlertResolved(
  personId: string,
  code: MembershipAlertCode,
  resolved: boolean,
): Promise<void> {
  const { error } = resolved
    ? await supabase.from('membership_alert_resolutions').insert({ person_id: personId, code })
    : await supabase.from('membership_alert_resolutions').delete().eq('person_id', personId).eq('code', code);
  if (error) throw error;
}

export async function countMembershipPending(): Promise<number> {
  const { count, error } = await supabase
    .from('people')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'membership_pending');
  if (error) throw error;
  return count ?? 0;
}

export interface MembershipQueueRow {
  id: string;
  name: string;
  entryType: EntryType | null;
  originChurch: string | null;
  cohortName: string | null;
  statuteAgreedAt: string | null;
  reviewReasons: string[];
}

export async function listMembershipQueue(): Promise<MembershipQueueRow[]> {
  const { data: people, error: peopleError } = await supabase
    .from('people')
    .select('id, name, entry_type, statute_agreed_at')
    .eq('status', 'membership_pending');
  if (peopleError) throw peopleError;

  const pending = (people ?? []).map((person) => ({ ...person, entry_type: toEntryType(person.entry_type) }));
  const ids = pending.map((person) => person.id);
  if (ids.length === 0) return [];

  const [sensitive, enrollments, alerts] = await Promise.all([
    supabase.from('person_sensitive').select('person_id, origin_church').in('person_id', ids),
    supabase
      .from('enrollments')
      .select('person_id, cohort:cohorts(name)')
      .in('person_id', ids)
      .order('created_at', { ascending: false }),
    listMembershipAlerts(ids),
  ]);
  const failure = sensitive.error ?? enrollments.error;
  if (failure) throw failure;

  const sensitiveById = new Map((sensitive.data ?? []).map((row) => [row.person_id, row]));
  const cohortById = new Map<string, string>();
  for (const row of enrollments.data ?? []) {
    if (row.cohort && !cohortById.has(row.person_id)) cohortById.set(row.person_id, row.cohort.name);
  }

  return pending
    .map((person) => ({
      id: person.id,
      name: person.name,
      entryType: person.entry_type,
      originChurch: sensitiveById.get(person.id)?.origin_church ?? null,
      cohortName: cohortById.get(person.id) ?? null,
      statuteAgreedAt: person.statute_agreed_at,
      reviewReasons: alerts
        .filter((alert) => alert.person_id === person.id && !alert.resolved)
        .map((alert) => MEMBERSHIP_ALERT_LABELS[alert.code]),
    }))
    .sort(byName);
}
