// Local
import { Person } from '../features/visitors';
import { comparePeopleByPipeline, INTEGRATION_STATUSES, PersonStatus, VISITOR_QUEUE_STATUSES } from '../types/person';
import { supabase } from '../lib/supabase';

const VISIBLE_STATUSES: PersonStatus[] = [...VISITOR_QUEUE_STATUSES, 'archived'];

export async function listVisitors(): Promise<Person[]> {
  const { data, error } = await supabase.from('people').select('*').in('status', VISIBLE_STATUSES);
  if (error) throw error;
  return (data as Person[]).sort(comparePeopleByPipeline);
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
    cohortPersonIds = (data ?? []).map((r) => r.person_id as string);
    if (cohortPersonIds.length === 0) return [];
  }

  let query = supabase
    .from('people')
    .select('id,name,status,whatsapp_opened_at,class_invite_sent_at,membership_interest_sent_at')
    .in('status', statusFilter.length > 0 ? statusFilter : INTEGRATION_STATUSES);
  if (search) query = query.ilike('name', `%${search}%`);
  if (cohortPersonIds) query = query.in('id', cohortPersonIds);

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? [])
    .map((p) => ({
      id: p.id as string,
      name: p.name as string,
      status: p.status as PersonStatus,
      whatsapp_opened_at: p.whatsapp_opened_at as string | null,
      class_invite_sent_at: p.class_invite_sent_at as string | null,
      membership_interest_sent_at: p.membership_interest_sent_at as string | null,
    }))
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
