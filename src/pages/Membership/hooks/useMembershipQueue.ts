// Local
import { listMembershipAlerts, MEMBERSHIP_ALERT_LABELS } from '../../../domain/membership';
import { errorMessage, useQuery } from '../../../lib/queryCache';
import { queryKeys } from '../../../lib/queryKeys';
import { supabase } from '../../../lib/supabase';
import { EntryType } from '../../../types/church';

interface MembershipQueueRow {
  id: string;
  name: string;
  entryType: EntryType | null;
  originChurch: string | null;
  cohortName: string | null;
  statuteAgreedAt: string | null;
  reviewReasons: string[];
}

interface PendingPersonRow {
  id: string;
  name: string;
  entry_type: EntryType | null;
  statute_agreed_at: string | null;
}

interface SensitiveRow {
  person_id: string;
  origin_church: string | null;
}

interface EnrollmentRow {
  person_id: string;
  cohort: { name: string } | null;
}

async function listMembershipQueue(): Promise<MembershipQueueRow[]> {
  const { data: people, error: peopleError } = await supabase
    .from('people')
    .select('id, name, entry_type, statute_agreed_at')
    .eq('status', 'membership_pending');
  if (peopleError) throw peopleError;

  const pending = (people ?? []) as PendingPersonRow[];
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

  const sensitiveById = new Map(((sensitive.data ?? []) as SensitiveRow[]).map((row) => [row.person_id, row]));
  const cohortById = new Map<string, string>();
  for (const row of (enrollments.data ?? []) as unknown as EnrollmentRow[]) {
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
    .sort((a, b) => (a.statuteAgreedAt ?? '9999').localeCompare(b.statuteAgreedAt ?? '9999'));
}

export function useMembershipQueue() {
  const query = useQuery(queryKeys.membershipQueue, listMembershipQueue);
  return { rows: query.data ?? [], loading: query.loading, error: errorMessage(query.error) };
}
