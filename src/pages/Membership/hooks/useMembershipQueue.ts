// React
import { useCallback, useEffect, useState } from 'react';
// Components
import { listMembershipAlerts, MEMBERSHIP_ALERT_LABELS } from '../../../domain/membershipAlerts';
import { supabase } from '../../../lib/supabase';
import { EntryType } from '../../../types/church';

export interface MembershipQueueRow {
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

export function useMembershipQueue() {
  const [rows, setRows] = useState<MembershipQueueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: people, error: peopleError } = await supabase
      .from('people')
      .select('id, name, entry_type, statute_agreed_at')
      .eq('status', 'membership_pending');

    if (peopleError) {
      setError(peopleError.message);
      setLoading(false);
      return;
    }

    const pending = (people ?? []) as PendingPersonRow[];
    const ids = pending.map((person) => person.id);

    const [sensitive, enrollments, alerts] = ids.length
      ? await Promise.all([
          supabase.from('person_sensitive').select('person_id, origin_church').in('person_id', ids),
          supabase
            .from('enrollments')
            .select('person_id, cohort:cohorts(name)')
            .in('person_id', ids)
            .order('created_at', { ascending: false }),
          listMembershipAlerts(ids),
        ])
      : [{ data: [], error: null }, { data: [], error: null }, []];

    const failure = sensitive.error ?? enrollments.error;
    if (failure) {
      setError(failure.message);
      setLoading(false);
      return;
    }

    const sensitiveById = new Map(((sensitive.data ?? []) as SensitiveRow[]).map((row) => [row.person_id, row]));
    const cohortById = new Map<string, string>();
    for (const row of (enrollments.data ?? []) as unknown as EnrollmentRow[]) {
      if (row.cohort && !cohortById.has(row.person_id)) cohortById.set(row.person_id, row.cohort.name);
    }

    setRows(
      pending
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
        .sort((a, b) => (a.statuteAgreedAt ?? '9999').localeCompare(b.statuteAgreedAt ?? '9999')),
    );
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { rows, loading, error };
}
