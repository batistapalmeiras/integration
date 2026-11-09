// Local
import { TableRow, TableUpdate } from '../lib/database.types';
import {
  comparePeopleByPipeline,
  INTEGRATION_STATUSES,
  Person,
  PersonStatus,
  toPersonStatus,
  VISITOR_QUEUE_STATUSES,
} from '../types/person';
import { nameOrPhoneFilter } from '../domain/search';
import { supabase } from '../lib/supabase';

const toPerson = (row: TableRow<'people'>): Person => ({ ...row, status: toPersonStatus(row.status) });

const VISIBLE_STATUSES: PersonStatus[] = [...VISITOR_QUEUE_STATUSES, 'archived'];

export async function listVisitors(): Promise<Person[]> {
  const { data, error } = await supabase.from('people').select('*').in('status', VISIBLE_STATUSES);
  if (error) throw error;
  return data.map(toPerson).sort(comparePeopleByPipeline);
}

export interface ReportFilters {
  statusFilter: PersonStatus[];
  cohortFilter: string;
  search: string;
}

export async function listPeople({ statusFilter, cohortFilter, search }: ReportFilters): Promise<PersonRow[]> {
  let cohortPersonIds: string[] | null = null;
  if (cohortFilter !== 'all') {
    const { data, error } = await supabase
      .from('enrollments')
      .select('person_id, cohort:cohorts!inner(name)')
      .eq('cohort.name', cohortFilter);
    if (error) throw error;
    cohortPersonIds = (data ?? []).map((row) => row.person_id);
    if (cohortPersonIds.length === 0) return [];
  }

  let query = supabase
    .from('people')
    .select('id,name,status,whatsapp_opened_at,class_invite_sent_at,membership_interest_sent_at')
    .in('status', statusFilter.length > 0 ? statusFilter : INTEGRATION_STATUSES);
  if (search) query = query.or(nameOrPhoneFilter(search));
  if (cohortPersonIds) query = query.in('id', cohortPersonIds);

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? [])
    .map((person) => ({ ...person, status: toPersonStatus(person.status) }))
    .sort(comparePeopleByPipeline);
}

export interface PersonRow {
  id: string;
  name: string;
  status: PersonStatus;
  whatsapp_opened_at: string | null;
  class_invite_sent_at: string | null;
  membership_interest_sent_at: string | null;
}

export interface NewVisitor {
  name: string;
  phone: string;
  age: number | null;
  email: string | null;
}

export async function createVisitor(visitor: NewVisitor): Promise<void> {
  const { error } = await supabase.from('people').insert(visitor);
  if (error) throw error;
}

export async function fetchPerson(id: string): Promise<Person> {
  const { data, error } = await supabase.from('people').select('*').eq('id', id).single();
  if (error) throw error;
  return toPerson(data);
}

export async function updatePersonFields(id: string, fields: TableUpdate<'people'>): Promise<Person> {
  const { data, error } = await supabase.from('people').update(fields).eq('id', id).select('*').single();
  if (error) throw error;
  return toPerson(data);
}

export async function updatePersonStatus(
  id: string,
  toStatus: PersonStatus,
  extra: TableUpdate<'people'> = {},
): Promise<Person> {
  return updatePersonFields(id, { status: toStatus, updated_at: new Date().toISOString(), ...extra });
}

export async function insertStatusHistory(entry: {
  personId: string;
  fromStatus: PersonStatus;
  toStatus: PersonStatus;
  changedBy?: string;
  note?: string | null;
}): Promise<void> {
  const { error } = await supabase.from('status_history').insert({
    person_id: entry.personId,
    from_status: entry.fromStatus,
    to_status: entry.toStatus,
    changed_by: entry.changedBy,
    note: entry.note ?? null,
  });
  if (error) throw error;
}

export async function insertContactAttempt(personId: string, result: string, madeBy?: string): Promise<void> {
  const { error } = await supabase
    .from('contact_attempts')
    .insert({ person_id: personId, channel: 'text', result, made_by: madeBy });
  if (error) throw error;
}

export async function updateContactAttemptResult(attemptId: string, result: string): Promise<void> {
  const { error } = await supabase.from('contact_attempts').update({ result }).eq('id', attemptId);
  if (error) throw error;
}

export interface PersonProfileSummary {
  coffeeDate: string | null;
  cohortName: string | null;
  smallGroupName: string | null;
  ministryNames: string[];
  ministryIds: string[];
}

export async function fetchPersonProfileSummary(personId: string): Promise<PersonProfileSummary> {
  const { data, error } = await supabase
    .from('people')
    .select(
      'small_group:small_groups(name), person_ministries(ministry_id, ministry:ministries(name)), enrollments(created_at, cohort:cohorts(name)), coffee_attendance(attended, coffee_event:coffee_events(event_date))',
    )
    .eq('id', personId)
    .single();
  if (error) throw error;

  const row = data;
  const latestEnrollment = [...row.enrollments].sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
  const attendedDates = row.coffee_attendance
    .filter((a) => a.attended && a.coffee_event)
    .map((a) => a.coffee_event!.event_date)
    .sort();

  return {
    coffeeDate: attendedDates.at(-1) ?? null,
    cohortName: latestEnrollment?.cohort?.name ?? null,
    smallGroupName: row.small_group?.name ?? null,
    ministryNames: row.person_ministries
      .map((m) => m.ministry?.name)
      .filter((name): name is string => !!name)
      .sort((a, b) => a.localeCompare(b, 'pt-BR')),
    ministryIds: row.person_ministries.map((m) => m.ministry_id),
  };
}

export async function fetchLastContactAttempt(
  personId: string,
): Promise<{ id: string; result: string; created_at: string } | null> {
  const { data, error } = await supabase
    .from('contact_attempts')
    .select('id, result, created_at')
    .eq('person_id', personId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function deletePersonRow(id: string): Promise<void> {
  const { error } = await supabase.from('people').delete().eq('id', id);
  if (error) throw error;
}

export async function findPersonByPhone(digits: string): Promise<Person | null> {
  const { data, error } = await supabase.from('people').select('*').eq('phone', digits).limit(1).maybeSingle();
  if (error) throw error;
  return data && toPerson(data);
}
